#requires -Version 5.1
<#
.SYNOPSIS
Instructor solution: import employees.csv from the OnlyMAGS exercise into AD.
.DESCRIPTION
Run with the ActiveDirectory RSAT module and delegated rights in the target AD.
All rows, OUs, groups and account conflicts are checked before any changes.
Existing accounts with the same UPN are skipped, never modified or re-enabled.
New accounts stay disabled until password and all group assignments succeed.
Permissions and ExpectedGPOs are documentation: this script does not change ACLs
or GPO links. It creates new identities; passwords and SIDs are not migrated.
.EXAMPLE
.\Import-Employees.ps1 -CsvPath .\employees.csv -Server dc01.mags.local -WhatIf
.EXAMPLE
$password = Read-Host 'Temporary password for this lab batch' -AsSecureString
.\Import-Employees.ps1 -CsvPath .\employees.csv -Server dc01.mags.local -InitialPassword $password |
    Export-Csv .\import-results.csv -NoTypeInformation -Encoding UTF8
.NOTES
The shared temporary password is for this classroom lab. Users must change it
at first logon. Never put plaintext passwords in the CSV or script.
On partial failure, inspect the disabled account and report before retrying;
existing accounts are deliberately not resumed automatically.
This file is not imported by the frontend and must not be placed in public/.
#>
[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'Medium')]
param(
    [Parameter(Mandatory = $true)]
    [ValidateScript({ Test-Path -LiteralPath $_ -PathType Leaf })]
    [string]$CsvPath,
    [ValidateSet(';', ',')][string]$Delimiter = ';',
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$Server,
    [System.Security.SecureString]$InitialPassword
)

$ErrorActionPreference = 'Stop'
$timer = [Diagnostics.Stopwatch]::StartNew()
$phaseTimer = [Diagnostics.Stopwatch]::StartNew()
$phaseTimes = [ordered]@{ Startup = 0.0; Validation = 0.0; Processing = 0.0 }
$phase = 'Startup'
$counts = @{ Created = 0; SkippedExisting = 0; WhatIf = 0; Declined = 0; Failed = 0 }
$samples = [System.Collections.Generic.List[double]]::new()
$failureNotes = [System.Collections.Generic.List[string]]::new()
$total = 0
$processed = 0
$memberships = 0
$stopReason = $null
function Write-ReportLine([string]$Text = '', [string]$Color = 'Gray') {
    # Fixed width, ASCII borders and no ANSI dependencies: also works in PS 5.1.
    foreach ($line in ($Text -split '\r?\n')) {
        while ($line.Length -gt 68) {
            $wrap = $line.LastIndexOf(' ', 68)
            if ($wrap -lt 1) { $wrap = 68 }
            Write-Host ('  | ' + $line.Substring(0, $wrap).PadRight(68) + ' |') -ForegroundColor $Color
            $line = $line.Substring($wrap).TrimStart()
        }
        Write-Host ('  | ' + $line.PadRight(68) + ' |') -ForegroundColor $Color
    }
}
function Write-ImportReport {
    $border = '  +' + ('-' * 70) + '+'
    $outcome = if ($stopReason) { 'STOPPED / ACTION REQUIRED' } elseif ($WhatIfPreference) { 'PREVIEW COMPLETE - NO AD CHANGES' } else { 'COMPLETED' }
    $color = if ($stopReason) { 'Red' } elseif ($WhatIfPreference -or $counts.Declined) { 'Yellow' } else { 'Green' }
    Write-Host "`n$border" -ForegroundColor Cyan
    Write-ReportLine 'ONLYMAGS  /  AD IMPORT REPORT' Cyan
    Write-ReportLine $outcome $color
    Write-ReportLine "Server: $Server"
    Write-Host $border -ForegroundColor Cyan
    Write-ReportLine ("RESULTS    {0}/{1} rows processed" -f $processed, $total) White
    Write-ReportLine ("Created + enabled  {0,6}     Existing / skipped  {1,6}" -f $counts.Created, $counts.SkippedExisting) Green
    Write-ReportLine ("Preview only       {0,6}     Declined            {1,6}" -f $counts.WhatIf, $counts.Declined)
    Write-ReportLine ("Failed             {0,6}     Not processed       {1,6}" -f $counts.Failed, ($total - $processed)) $color
    Write-ReportLine ("Group additions    {0,6}  (successful operations)" -f $memberships)
    Write-ReportLine
    Write-ReportLine 'TIMING     Measured on this run' White
    Write-ReportLine ("Total elapsed      {0,10:N2} s" -f $timer.Elapsed.TotalSeconds)
    foreach ($name in $phaseTimes.Keys) {
        Write-ReportLine ("{0,-19}{1,10:N2} s" -f $name, $phaseTimes[$name])
    }
    Write-ReportLine 'Phase times include console output and any user input.' DarkGray
    Write-ReportLine
    Write-ReportLine 'BENCHMARK  Successful account provisioning' White
    if ($samples.Count -gt 0) {
        $sorted = @($samples | Sort-Object)
        $stats = $samples | Measure-Object -Average -Sum
        $p95 = $sorted[[int][Math]::Ceiling(0.95 * $sorted.Count) - 1]
        Write-ReportLine ("Throughput         {0,10:N2} users/s  |  Sample: {1}" -f ($samples.Count / $stats.Sum), $samples.Count) Cyan
        Write-ReportLine ("Average / P95      {0:N3} s / {1:N3} s" -f $stats.Average, $p95)
        Write-ReportLine ("Fastest / slowest   {0:N3} s / {1:N3} s" -f $sorted[0], $sorted[-1])
        Write-ReportLine 'Create -> password -> groups -> enable; includes status output.' DarkGray
        Write-ReportLine 'Excludes prompts, validation, skipped and failed accounts.' DarkGray
    } else {
        Write-ReportLine 'N/A - no successfully provisioned accounts in this run.'
    }
    if ($stopReason) {
        Write-ReportLine
        Write-ReportLine 'ATTENTION' Red
        Write-ReportLine (($stopReason -split '\r?\n')[0]) Red
        foreach ($note in ($failureNotes | Select-Object -First 5)) { Write-ReportLine $note Yellow }
        if ($failureNotes.Count -gt 5) { Write-ReportLine "$($failureNotes.Count - 5) more errors: see status output above." Yellow }
        if ($counts.Failed) { Write-ReportLine 'Inspect failed accounts before retrying. Changes are not rolled back.' Yellow }
    }
    Write-Host $border -ForegroundColor Cyan
    Write-Host
}
function Write-ImportStatus([string]$Message, [int]$Percent = -1) {
    # Host/progress streams stay separate from the result objects sent to Export-Csv.
    Write-Host ("[{0}] {1}" -f (Get-Date -Format 'HH:mm:ss'), $Message)
    Write-Progress -Id 1 -Activity 'OnlyMAGS AD import' -Status $Message -PercentComplete $Percent
}

try {
Write-ImportStatus 'Starting: loading the ActiveDirectory module...'
Import-Module ActiveDirectory -ErrorAction Stop
Write-ImportStatus "Connecting to $Server and reading domain information..."
$domain = Get-ADDomain -Server $Server
Write-ImportStatus "Connected to $($domain.DNSRoot). Reading CSV: $CsvPath"
$employees = @(Import-Csv -LiteralPath $CsvPath -Delimiter $Delimiter -Encoding UTF8)
$total = $employees.Count
$phaseTimes[$phase] = $phaseTimer.Elapsed.TotalSeconds
$phase = 'Validation'
$phaseTimer.Restart()
if ($employees.Count -eq 0) { throw 'The CSV contains no employees.' }
Write-ImportStatus "Loaded $($employees.Count) employees. Phase 1/2: validating the entire batch; no AD changes yet." 0
if ($WhatIfPreference) { Write-Host 'WHATIF MODE: validation will query AD, but no accounts or groups will be changed.' -ForegroundColor Yellow }
$required = @('EmployeeID', 'GivenName', 'Surname', 'DisplayName', 'TargetCompany',
    'TargetDomain', 'SamAccountName', 'UserPrincipalName', 'Department', 'Title',
    'TargetOU', 'Groups', 'Permissions', 'ExpectedGPOs')
foreach ($column in $required) {
    if ($employees[0].PSObject.Properties.Name -notcontains $column) {
        throw "Missing CSV column '$column'. Check -Delimiter (default: semicolon)."
    }
}

function Escape-LdapValue([string]$Value) {
    return $Value.Replace('\', '\5c').Replace('*', '\2a').Replace('(', '\28').Replace(')', '\29').Replace([string][char]0, '\00')
}

# Phase 1: preflight the complete batch. Do not create users in this phase.
$issues = [System.Collections.Generic.List[string]]::new()
$plan = [System.Collections.Generic.List[object]]::new()
$seenAccounts = @{}
$seenUpns = @{}
$ouCache = @{}
$groupCache = @{}
$rowNumber = 1
foreach ($employee in $employees) {
    $rowNumber++
    $percent = [int](50 * ($rowNumber - 2) / $employees.Count)
    Write-ImportStatus "Validating $($rowNumber - 1)/$($employees.Count): $($employee.SamAccountName)" $percent
    try {
        foreach ($column in $required | Where-Object { $_ -notin @('Groups', 'Permissions', 'ExpectedGPOs') }) {
            if ([string]::IsNullOrWhiteSpace($employee.$column)) { throw "Empty required value: $column" }
        }
        $account = $employee.SamAccountName.Trim()
        $upn = $employee.UserPrincipalName.Trim()
        $ouPath = $employee.TargetOU.Trim()
        if ($account -notmatch '^[a-zA-Z0-9.]{1,20}$') { throw 'SamAccountName must use 1-20 letters, digits or dots (generator format).' }
        if ($employee.TargetDomain.Trim() -ine $domain.DNSRoot) { throw "TargetDomain does not match $($domain.DNSRoot)." }
        if ($upn -ine "$account@$($domain.DNSRoot)") { throw 'UPN must match SamAccountName@TargetDomain (generator format).' }
        if ($seenAccounts.ContainsKey($account) -or $seenUpns.ContainsKey($upn)) { throw 'Duplicate account or UPN in CSV.' }
        $seenAccounts[$account] = $true
        $seenUpns[$upn] = $true
        if (-not $ouPath.EndsWith(",$($domain.DistinguishedName)", [StringComparison]::OrdinalIgnoreCase)) { throw 'TargetOU is outside the target domain.' }
        if (-not $ouCache.ContainsKey($ouPath)) {
            Write-ImportStatus "Checking OU: $ouPath" $percent
            $ouCache[$ouPath] = Get-ADOrganizationalUnit -Identity $ouPath -Server $Server
        }
        $groups = @($employee.Groups -split '\|' | ForEach-Object { $_.Trim() } | Where-Object { $_ } | Sort-Object -Unique)
        $groupDns = @(foreach ($groupName in $groups) {
            if (-not $groupCache.ContainsKey($groupName)) {
                Write-ImportStatus "Checking group: $groupName" $percent
                $group = Get-ADGroup -Identity $groupName -Server $Server
                if ($group.GroupCategory -ne 'Security') { throw "Group '$groupName' is not a security group." }
                $groupCache[$groupName] = $group.DistinguishedName
            }
            $groupCache[$groupName]
        })
        $accountFilter = Escape-LdapValue $account
        $upnFilter = Escape-LdapValue $upn
        # Query all AD object types so a computer/service account collision also fails.
        Write-ImportStatus "Checking account/UPN conflicts: $account" $percent
        $conflicts = @(Get-ADObject -LDAPFilter "(|(sAMAccountName=$accountFilter)(userPrincipalName=$upnFilter))" -Properties sAMAccountName, userPrincipalName -Server $Server)
        $existing = $false
        if ($conflicts.Count -gt 0) {
            if ($conflicts.Count -ne 1 -or $conflicts[0].ObjectClass -ne 'user' -or
                $conflicts[0].sAMAccountName -ine $account -or $conflicts[0].userPrincipalName -ine $upn) {
                throw 'Account or UPN belongs to another AD object.'
            }
            $existing = $true
        }
        $plan.Add([pscustomobject]@{ Row = $employee; Account = $account; Upn = $upn;
            OU = $ouCache[$ouPath].DistinguishedName; Groups = $groupDns; Existing = $existing })
    } catch {
        $issues.Add("Row ${rowNumber}: $($_.Exception.Message)")
        $failureNotes.Add("Row ${rowNumber}: $($_.Exception.Message)")
        Write-Host "Validation failed for row ${rowNumber}: $($_.Exception.Message)" -ForegroundColor Red
    }
}
if ($issues.Count -gt 0) { throw ("Preflight failed. No AD changes were made.`n" + ($issues -join "`n")) }

# Phase 2: provision only after the entire CSV has passed preflight.
$phaseTimes[$phase] = $phaseTimer.Elapsed.TotalSeconds
$phase = 'Processing'
$phaseTimer.Restart()
$failed = 0
$processed = 0
$counts = @{ Created = 0; SkippedExisting = 0; WhatIf = 0; Declined = 0; Failed = 0 }
Write-ImportStatus "Validation passed. Phase 2/2: processing $($plan.Count) employees." 50
foreach ($item in $plan) {
    $percent = 50 + [int](50 * $processed / $plan.Count)
    Write-ImportStatus "Processing $($processed + 1)/$($plan.Count): $($item.Account)" $percent
    $employee = $item.Row
    $result = [ordered]@{ SamAccountName = $item.Account; UserPrincipalName = $item.Upn;
        Status = ''; Details = ''; TargetOU = $item.OU; Groups = ($item.Groups -join '|');
        ExpectedGPOs = $employee.ExpectedGPOs; Permissions = $employee.Permissions }
    if ($item.Existing) {
        $result.Status = 'SkippedExisting'
        $result.Details = 'Account exists. No password, groups, OU or enabled state changed.'
    } elseif ($PSCmdlet.ShouldProcess("$($item.Upn) in $($item.OU)", "Create user, assign $($item.Groups.Count) groups and enable account")) {
        $created = $null
        $accountTimer = $null
        try {
            if ($null -eq $InitialPassword) {
                Write-ImportStatus 'Waiting for your temporary lab password. Input is hidden; press Enter to continue.' $percent
                $InitialPassword = Read-Host 'Temporary password for this lab batch' -AsSecureString
            }
            if ($InitialPassword.Length -eq 0) { throw 'The temporary password cannot be empty.' }
            $accountTimer = [Diagnostics.Stopwatch]::StartNew()
            $parameters = @{
                # Use the unique account for CN, avoiding duplicate display-name conflicts.
                Name = $item.Account; SamAccountName = $item.Account; UserPrincipalName = $item.Upn
                GivenName = $employee.GivenName; Surname = $employee.Surname; DisplayName = $employee.DisplayName
                EmployeeID = $employee.EmployeeID; Company = $employee.TargetCompany
                Department = $employee.Department; Title = $employee.Title; Path = $item.OU
                Enabled = $false; Server = $Server; PassThru = $true; ErrorAction = 'Stop'
            }
            Write-ImportStatus "$($item.Account): creating disabled account..." $percent
            $created = New-ADUser @parameters
            Write-ImportStatus "$($item.Account): setting temporary password..." $percent
            Set-ADAccountPassword -Identity $created.DistinguishedName -Reset -NewPassword $InitialPassword -Server $Server -ErrorAction Stop
            Write-ImportStatus "$($item.Account): requiring password change at first logon..." $percent
            Set-ADUser -Identity $created.DistinguishedName -ChangePasswordAtLogon $true -Server $Server -ErrorAction Stop
            foreach ($groupDn in $item.Groups) {
                Write-ImportStatus "$($item.Account): adding membership in $groupDn..." $percent
                Add-ADGroupMember -Identity $groupDn -Members $created.DistinguishedName -Server $Server -ErrorAction Stop
                $memberships++
            }
            Write-ImportStatus "$($item.Account): enabling account..." $percent
            Enable-ADAccount -Identity $created.DistinguishedName -Server $Server -ErrorAction Stop
            $accountTimer.Stop()
            $samples.Add($accountTimer.Elapsed.TotalSeconds)
            $result.Status = 'Created'
            $result.Details = 'Account enabled; password change required at first logon.'
        } catch {
            $failed++
            $result.Status = 'Failed'
            $result.Details = $_.Exception.Message
            if ($null -ne $created) { $result.Details += ' New account may be partially configured; inspect it before retrying. It was created disabled.' }
            $failureNotes.Add("$($item.Account): $($result.Details)")
        } finally {
            if ($null -ne $accountTimer) { $accountTimer.Stop() }
        }
    } else {
        $result.Status = if ($WhatIfPreference) { 'WhatIf' } else { 'Declined' }
        $result.Details = 'No AD changes made.'
    }
    $processed++
    $counts[$result.Status]++
    Write-ImportStatus "$processed/$($plan.Count) - $($item.Account): $($result.Status). $($result.Details)" (50 + [int](50 * $processed / $plan.Count))
    [pscustomobject]$result
}
if ($failed -gt 0) { throw "$failed employee(s) failed. Review the emitted results; successful changes were not rolled back." }
} catch {
    $stopReason = $_.Exception.Message
    Write-Host ("Import stopped after {0:n1}s: {1}" -f $timer.Elapsed.TotalSeconds, $_.Exception.Message) -ForegroundColor Red
    throw
} finally {
    $timer.Stop()
    $phaseTimer.Stop()
    $phaseTimes[$phase] = $phaseTimer.Elapsed.TotalSeconds
    Write-Progress -Id 1 -Activity 'OnlyMAGS AD import' -Completed
    Write-ImportReport
}
