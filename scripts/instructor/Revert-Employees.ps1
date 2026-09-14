#requires -Version 5.1
<#
.SYNOPSIS
Remove the lab users listed in the original OnlyMAGS employees.csv.
.DESCRIPTION
Validates the complete batch before deletion. Matches domain, account, UPN,
EmployeeID and the original OU. Missing accounts are skipped. Deletes by GUID
and rechecks identity immediately before deletion. Does not delete groups/OUs.
The CSV is not an import audit: matching users that existed before import can
also be deleted. This removes accounts; it is not a restore of prior AD state.
.EXAMPLE
.\Revert-Employees.ps1 -CsvPath .\employees.csv -Server dc01.mags.local -WhatIf
.EXAMPLE
.\Revert-Employees.ps1 -CsvPath .\employees.csv -Server dc01.mags.local
#>
[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'High')]
param(
    [Parameter(Mandatory = $true)]
    [ValidateScript({ Test-Path -LiteralPath $_ -PathType Leaf })][string]$CsvPath,
    [ValidateSet(';', ',')][string]$Delimiter = ';',
    [Parameter(Mandatory = $true)][ValidateNotNullOrEmpty()][string]$Server
)
$ErrorActionPreference = 'Stop'
$timer = [Diagnostics.Stopwatch]::StartNew()
$counts = @{ Deleted = 0; Missing = 0; WhatIf = 0; Declined = 0; Failed = 0 }
$total = 0
$processed = 0
$stopReason = $null
$plan = [System.Collections.Generic.List[object]]::new()
$issues = [System.Collections.Generic.List[string]]::new()
function Write-RevertStatus([string]$Message, [int]$Percent = -1) {
    Write-Host ('[{0}] {1}' -f (Get-Date -Format 'HH:mm:ss'), $Message)
    Write-Progress -Id 2 -Activity 'OnlyMAGS AD revert' -Status $Message -PercentComplete $Percent
}
function Escape-LdapValue([string]$Value) {
    return $Value.Replace('\', '\5c').Replace('*', '\2a').Replace('(', '\28').Replace(')', '\29').Replace([string][char]0, '\00')
}
function Assert-UserMatch($User, $Row) {
    if ($User.ObjectClass -ne 'user' -or
        $User.SamAccountName -ine $Row.SamAccountName.Trim() -or
        $User.UserPrincipalName -ine $Row.UserPrincipalName.Trim() -or
        $User.EmployeeID -ine $Row.EmployeeID.Trim() -or
        $User.DistinguishedName -ine "CN=$($Row.SamAccountName.Trim()),$($Row.TargetOU.Trim())") {
        throw 'AD identity, EmployeeID or original OU does not match CSV. No deletion for this row.'
    }
}
try {
    Write-RevertStatus 'Loading ActiveDirectory module...'
    Import-Module ActiveDirectory -ErrorAction Stop
    Write-RevertStatus "Connecting to $Server..."
    $domain = Get-ADDomain -Server $Server
    Write-RevertStatus "Reading CSV: $CsvPath"
    $rows = @(Import-Csv -LiteralPath $CsvPath -Delimiter $Delimiter -Encoding UTF8)
    $total = $rows.Count
    if ($total -eq 0) { throw 'The CSV contains no employees.' }
    $required = @('TargetDomain', 'SamAccountName', 'UserPrincipalName', 'EmployeeID', 'TargetOU')
    foreach ($column in $required) {
        if ($rows[0].PSObject.Properties.Name -notcontains $column) { throw "Missing CSV column '$column'. Check -Delimiter." }
    }
    $seen = @{}
    $index = 0
    foreach ($row in $rows) {
        $index++
        Write-RevertStatus "Validating $index/${total}: $($row.SamAccountName)" ([int](50 * ($index - 1) / $total))
        try {
            foreach ($column in $required) {
                if ([string]::IsNullOrWhiteSpace($row.$column)) { throw "Empty required value: $column" }
            }
            $account = $row.SamAccountName.Trim()
            if ($account -notmatch '^[a-zA-Z0-9.]{1,20}$') { throw 'Invalid generator account name.' }
            if ($row.TargetDomain.Trim() -ine $domain.DNSRoot) { throw 'TargetDomain does not match connected AD.' }
            if ($row.UserPrincipalName.Trim() -ine "$account@$($domain.DNSRoot)") { throw 'UPN does not match account and target domain.' }
            if (-not $row.TargetOU.Trim().EndsWith(",$($domain.DistinguishedName)", [StringComparison]::OrdinalIgnoreCase)) { throw 'TargetOU is outside the target domain.' }
            if ($seen.ContainsKey($account)) { throw 'Duplicate account in CSV.' }
            $seen[$account] = $true
            $sam = Escape-LdapValue $account
            $upn = Escape-LdapValue $row.UserPrincipalName.Trim()
            $found = @(Get-ADObject -LDAPFilter "(|(sAMAccountName=$sam)(userPrincipalName=$upn))" -Properties SamAccountName, UserPrincipalName, EmployeeID -Server $Server)
            if ($found.Count -gt 1) { throw 'Multiple AD objects match account/UPN.' }
            $guid = $null
            if ($found.Count -eq 1) {
                Assert-UserMatch $found[0] $row
                $guid = [guid]$found[0].ObjectGUID
                if ($guid -eq [guid]::Empty) { throw 'AD object has no usable GUID.' }
            }
            $plan.Add([pscustomobject]@{ Row = $row; Guid = $guid })
        } catch { $issues.Add("CSV row $($index + 1): $($_.Exception.Message)") }
    }
    if ($issues.Count) { throw ("Preflight failed. No users deleted.`n" + ($issues -join "`n")) }
    Write-RevertStatus "Validation passed. Processing $total users..." 50
    foreach ($item in $plan) {
        $row = $item.Row
        $result = [ordered]@{ SamAccountName = $row.SamAccountName.Trim(); UserPrincipalName = $row.UserPrincipalName.Trim(); ObjectGUID = $item.Guid; Status = ''; Details = '' }
        Write-RevertStatus "Processing $($processed + 1)/${total}: $($result.SamAccountName)" (50 + [int](50 * $processed / $total))
        if ($null -eq $item.Guid) {
            $result.Status = 'Missing'
            $result.Details = 'Account not found; nothing to delete.'
        } elseif ($PSCmdlet.ShouldProcess("$($result.UserPrincipalName) [$($item.Guid)]", 'Permanently remove AD user')) {
            try {
                Write-RevertStatus "Rechecking identity: $($result.SamAccountName)..."
                $current = Get-ADObject -Identity $item.Guid -Properties SamAccountName, UserPrincipalName, EmployeeID -Server $Server
                Assert-UserMatch $current $row
                Write-RevertStatus "Deleting: $($result.SamAccountName)..."
                Remove-ADUser -Identity $item.Guid -Server $Server -Confirm:$false -ErrorAction Stop
                $result.Status = 'Deleted'
                $result.Details = 'AD user removed.'
            } catch {
                $result.Status = 'Failed'
                $result.Details = $_.Exception.Message
            }
        } else {
            $result.Status = if ($WhatIfPreference) { 'WhatIf' } else { 'Declined' }
            $result.Details = 'No deletion performed.'
        }
        $processed++
        $counts[$result.Status]++
        Write-RevertStatus "$($result.SamAccountName): $($result.Status). $($result.Details)" (50 + [int](50 * $processed / $total))
        [pscustomobject]$result
    }
    if ($counts.Failed) { throw "$($counts.Failed) deletion(s) failed. Review results; completed deletions were not rolled back." }
} catch {
    $stopReason = $_.Exception.Message
    Write-Host $stopReason -ForegroundColor Red
    throw
} finally {
    $timer.Stop()
    Write-Progress -Id 2 -Activity 'OnlyMAGS AD revert' -Completed
    $color = if ($stopReason) { 'Red' } elseif ($WhatIfPreference) { 'Yellow' } else { 'Cyan' }
    $state = if ($stopReason) { 'STOPPED / ACTION REQUIRED' } elseif ($WhatIfPreference) { 'PREVIEW - NO USERS DELETED' } else { 'COMPLETED' }
    Write-Host "`n  +----------------------------------------------------------+" -ForegroundColor $color
    foreach ($line in @('ONLYMAGS / REVERT REPORT', $state,
        ("Processed: {0}/{1}   Not processed: {2}" -f $processed, $total, ($total - $processed)),
        ("Deleted: {0}   Missing: {1}   Failed: {2}" -f $counts.Deleted, $counts.Missing, $counts.Failed),
        ("Preview: {0}   Declined: {1}" -f $counts.WhatIf, $counts.Declined),
        ("Elapsed: {0:N2} s (includes confirmation waits)" -f $timer.Elapsed.TotalSeconds))) {
        Write-Host ('  | ' + $line.PadRight(56) + ' |') -ForegroundColor $color
    }
    Write-Host "  +----------------------------------------------------------+`n" -ForegroundColor $color
}
