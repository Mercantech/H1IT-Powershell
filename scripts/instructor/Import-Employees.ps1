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
Import-Module ActiveDirectory -ErrorAction Stop
$domain = Get-ADDomain -Server $Server
$employees = @(Import-Csv -LiteralPath $CsvPath -Delimiter $Delimiter -Encoding UTF8)
if ($employees.Count -eq 0) { throw 'The CSV contains no employees.' }
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
            $ouCache[$ouPath] = Get-ADOrganizationalUnit -Identity $ouPath -Server $Server
        }
        $groups = @($employee.Groups -split '\|' | ForEach-Object { $_.Trim() } | Where-Object { $_ } | Sort-Object -Unique)
        $groupDns = @(foreach ($groupName in $groups) {
            if (-not $groupCache.ContainsKey($groupName)) {
                $group = Get-ADGroup -Identity $groupName -Server $Server
                if ($group.GroupCategory -ne 'Security') { throw "Group '$groupName' is not a security group." }
                $groupCache[$groupName] = $group.DistinguishedName
            }
            $groupCache[$groupName]
        })
        $accountFilter = Escape-LdapValue $account
        $upnFilter = Escape-LdapValue $upn
        # Query all AD object types so a computer/service account collision also fails.
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
    } catch { $issues.Add("Row ${rowNumber}: $($_.Exception.Message)") }
}
if ($issues.Count -gt 0) { throw ("Preflight failed. No AD changes were made.`n" + ($issues -join "`n")) }

# Phase 2: provision only after the entire CSV has passed preflight.
$failed = 0
foreach ($item in $plan) {
    $employee = $item.Row
    $result = [ordered]@{ SamAccountName = $item.Account; UserPrincipalName = $item.Upn;
        Status = ''; Details = ''; TargetOU = $item.OU; Groups = ($item.Groups -join '|');
        ExpectedGPOs = $employee.ExpectedGPOs; Permissions = $employee.Permissions }
    if ($item.Existing) {
        $result.Status = 'SkippedExisting'
        $result.Details = 'Account exists. No password, groups, OU or enabled state changed.'
    } elseif ($PSCmdlet.ShouldProcess("$($item.Upn) in $($item.OU)", "Create user, assign $($item.Groups.Count) groups and enable account")) {
        $created = $null
        try {
            if ($null -eq $InitialPassword) {
                $InitialPassword = Read-Host 'Temporary password for this lab batch' -AsSecureString
            }
            if ($InitialPassword.Length -eq 0) { throw 'The temporary password cannot be empty.' }
            $parameters = @{
                # Use the unique account for CN, avoiding duplicate display-name conflicts.
                Name = $item.Account; SamAccountName = $item.Account; UserPrincipalName = $item.Upn
                GivenName = $employee.GivenName; Surname = $employee.Surname; DisplayName = $employee.DisplayName
                EmployeeID = $employee.EmployeeID; Company = $employee.TargetCompany
                Department = $employee.Department; Title = $employee.Title; Path = $item.OU
                Enabled = $false; Server = $Server; PassThru = $true; ErrorAction = 'Stop'
            }
            $created = New-ADUser @parameters
            Set-ADAccountPassword -Identity $created.DistinguishedName -Reset -NewPassword $InitialPassword -Server $Server -ErrorAction Stop
            Set-ADUser -Identity $created.DistinguishedName -ChangePasswordAtLogon $true -Server $Server -ErrorAction Stop
            foreach ($groupDn in $item.Groups) {
                Add-ADGroupMember -Identity $groupDn -Members $created.DistinguishedName -Server $Server -ErrorAction Stop
            }
            Enable-ADAccount -Identity $created.DistinguishedName -Server $Server -ErrorAction Stop
            $result.Status = 'Created'
            $result.Details = 'Account enabled; password change required at first logon.'
        } catch {
            $failed++
            $result.Status = 'Failed'
            $result.Details = $_.Exception.Message
            if ($null -ne $created) { $result.Details += ' New account may be partially configured; inspect it before retrying. It was created disabled.' }
        }
    } else {
        $result.Status = if ($WhatIfPreference) { 'WhatIf' } else { 'Declined' }
        $result.Details = 'No AD changes made.'
    }
    [pscustomobject]$result
}
if ($failed -gt 0) { throw "$failed employee(s) failed. Review the emitted results; successful changes were not rolled back." }
