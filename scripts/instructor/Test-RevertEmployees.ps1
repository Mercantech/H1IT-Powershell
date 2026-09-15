#requires -Version 5.1
# Cmdlet doubles only; never connects to AD.
$ErrorActionPreference = 'Stop'
$global:RevertTestUsers = @{}
$global:RevertTestDeleted = [System.Collections.Generic.List[guid]]::new()
$global:RevertTestFail = $false
function Assert($Condition, $Message) { if (-not $Condition) { throw $Message } }
function Import-Module { param($Name, $ErrorAction) }
function Get-ADDomain { param($Server) [pscustomobject]@{ DNSRoot = 'lab.local'; DistinguishedName = 'DC=lab,DC=local' } }
function Get-ADObject {
    param($LDAPFilter, $Identity, $Properties, $Server)
    if ($Identity) { return $global:RevertTestUsers[[guid]$Identity] }
    foreach ($user in $global:RevertTestUsers.Values) {
        if ($LDAPFilter.Contains("sAMAccountName=$($user.SamAccountName)")) { $user }
    }
}
function Remove-ADUser {
    param($Identity, $Server, $Confirm, $ErrorAction)
    Assert ($Identity -is [guid]) 'Deletion must use GUID'
    if ($global:RevertTestFail) { throw 'Simulated deletion failure' }
    $global:RevertTestDeleted.Add($Identity)
    $global:RevertTestUsers.Remove($Identity)
}
$directory = Join-Path ([IO.Path]::GetTempPath()) ('revert-test-' + [guid]::NewGuid())
[void](New-Item -ItemType Directory -Path $directory)
$csv = Join-Path $directory 'employees.csv'
$solution = Join-Path $PSScriptRoot 'Revert-Employees.ps1'
$rows = @(foreach ($i in 1..2) {
    $guid = [guid]::NewGuid()
    $global:RevertTestUsers[$guid] = [pscustomobject]@{ ObjectGUID = $guid; ObjectClass = 'user'; SamAccountName = "test$i";
        UserPrincipalName = "test$i@lab.local"; EmployeeID = "MIG$i"; DistinguishedName = "CN=test$i,OU=Users,DC=lab,DC=local" }
    [pscustomobject]@{ TargetDomain = 'lab.local'; SamAccountName = "test$i"; UserPrincipalName = "test$i@lab.local";
        EmployeeID = "MIG$i"; TargetOU = 'OU=Users,DC=lab,DC=local' }
})
try {
    $rows | Export-Csv -LiteralPath $csv -Delimiter ';' -NoTypeInformation
    $preview = @(& $solution -CsvPath $csv -Server dc.lab.local -WhatIf)
    Assert ($preview.Count -eq 2 -and $preview[0].Status -eq 'WhatIf' -and $global:RevertTestDeleted.Count -eq 0) 'WhatIf must never delete'
    $rows[1].EmployeeID = 'WRONG'
    $rows | Export-Csv -LiteralPath $csv -Delimiter ';' -NoTypeInformation
    $caught = $false
    try { & $solution -CsvPath $csv -Server dc.lab.local -Confirm:$false | Out-Null } catch { $caught = $_.Exception.Message -like 'Preflight failed*' }
    Assert ($caught -and $global:RevertTestDeleted.Count -eq 0) 'Mismatch must block the entire batch'
    $rows[1].EmployeeID = 'MIG2'
    $rows | Export-Csv -LiteralPath $csv -Delimiter ',' -NoTypeInformation
    $global:RevertTestFail = $true
    $caught = $false
    try { & $solution -CsvPath $csv -Delimiter ',' -Server dc.lab.local -Confirm:$false | Out-Null } catch { $caught = $_.Exception.Message -like '*deletion(s) failed*' }
    Assert ($caught -and $global:RevertTestDeleted.Count -eq 0) 'Deletion errors must fail the run'
    $global:RevertTestFail = $false
    $deleted = @(& $solution -CsvPath $csv -Delimiter ',' -Server dc.lab.local -Confirm:$false)
    Assert ($deleted.Count -eq 2 -and @($deleted | Where-Object Status -eq 'Deleted').Count -eq 2) 'Both matching users must be deleted; report must not pollute result stream'
    $again = @(& $solution -CsvPath $csv -Delimiter ',' -Server dc.lab.local -Confirm:$false)
    Assert (@($again | Where-Object Status -eq 'Missing').Count -eq 2) 'Rerun must skip missing users'
    Write-Output 'PASS: revert preview, batch identity validation, deletion failures, GUID deletion, delimiters, clean output and rerun.'
} finally {
    if (Test-Path -LiteralPath $csv) { Remove-Item -LiteralPath $csv }
    Remove-Item -LiteralPath $directory
}
