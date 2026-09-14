#requires -Version 5.1
# Runs the solution against cmdlet doubles. Never connects to AD.
$ErrorActionPreference = 'Stop'
$global:ImportTestStore = @{}
$global:ImportTestCalls = [System.Collections.Generic.List[string]]::new()
$global:ImportTestFailGroups = $false
function Assert($Condition, [string]$Message) { if (-not $Condition) { throw $Message } }
function Import-Module { param($Name, $ErrorAction) }
function Get-ADDomain { param($Server) [pscustomobject]@{ DNSRoot = 'lab.local'; DistinguishedName = 'DC=lab,DC=local' } }
function Get-ADOrganizationalUnit {
    param($Identity, $Server)
    if ($Identity -ne 'OU=Users,DC=lab,DC=local') { throw 'OU not found' }
    [pscustomobject]@{ DistinguishedName = $Identity }
}
function Get-ADGroup {
    param($Identity, $Server)
    if ($Identity -notin @('GG_Test', 'GG_Print')) { throw 'Group not found' }
    [pscustomobject]@{ DistinguishedName = "CN=$Identity,DC=lab,DC=local"; GroupCategory = 'Security' }
}
function Get-ADObject {
    param($LDAPFilter, $Properties, $Server)
    foreach ($user in $global:ImportTestStore.Values) {
        if ($LDAPFilter.Contains("sAMAccountName=$($user.sAMAccountName)")) { $user }
    }
}
function New-ADUser {
    param($Name, $SamAccountName, $UserPrincipalName, $GivenName, $Surname, $DisplayName,
        $EmployeeID, $Company, $Department, $Title, $Path, $Enabled, $Server, $PassThru, $ErrorAction)
    Assert (-not $Enabled) 'New accounts must start disabled'
    $global:ImportTestCalls.Add("Create:$SamAccountName")
    $user = [pscustomobject]@{ sAMAccountName = $SamAccountName; userPrincipalName = $UserPrincipalName;
        ObjectClass = 'user'; DistinguishedName = "CN=$Name,$Path" }
    $global:ImportTestStore[$SamAccountName] = $user
    $user
}
function Set-ADAccountPassword {
    param($Identity, [switch]$Reset, $NewPassword, $Server, $ErrorAction)
    Assert ($NewPassword -is [Security.SecureString]) 'Password must remain secure'
    $global:ImportTestCalls.Add("Password:$Identity")
}
function Set-ADUser {
    param($Identity, $ChangePasswordAtLogon, $Server, $ErrorAction)
    Assert $ChangePasswordAtLogon 'Password change must be required'
    $global:ImportTestCalls.Add("ChangeAtLogon:$Identity")
}
function Add-ADGroupMember {
    param($Identity, $Members, $Server, $ErrorAction)
    if ($global:ImportTestFailGroups) { throw 'Simulated group failure' }
    $global:ImportTestCalls.Add("Group:$Identity")
}
function Enable-ADAccount {
    param($Identity, $Server, $ErrorAction)
    $global:ImportTestCalls.Add("Enable:$Identity")
}

$directory = Join-Path ([IO.Path]::GetTempPath()) ('ad-import-test-' + [guid]::NewGuid().ToString())
[void](New-Item -ItemType Directory -Path $directory)
$csvPath = Join-Path $directory 'employees.csv'
$solution = Join-Path $PSScriptRoot 'Import-Employees.ps1'
$password = ConvertTo-SecureString 'Mock-password-only-123!' -AsPlainText -Force
$rows = @(foreach ($number in 1..2) {
    [pscustomobject]@{ EmployeeID = "MIG$number"; GivenName = 'Test'; Surname = "User$number";
        DisplayName = "Test User$number"; TargetCompany = 'Lab'; TargetDomain = 'lab.local';
        SamAccountName = "test.user$number"; UserPrincipalName = "test.user$number@lab.local";
        Department = 'IT'; Title = 'Support'; TargetOU = 'OU=Users,DC=lab,DC=local';
        Groups = 'GG_Test|GG_Print'; Permissions = 'Test access'; ExpectedGPOs = 'GPO_Baseline' }
})
try {
    $rows | Export-Csv -LiteralPath $csvPath -Delimiter ';' -Encoding UTF8 -NoTypeInformation
    $preview = @(& $solution -CsvPath $csvPath -Server 'dc.lab.local' -WhatIf -InformationVariable previewReport)
    Assert (($previewReport -join "`n") -match 'PREVIEW COMPLETE - NO AD CHANGES') 'Preview summary must clearly identify simulation'
    Assert (($previewReport -join "`n") -match 'N/A - no successfully provisioned') 'Preview must not report real provisioning throughput'
    Assert ($preview.Count -eq 2 -and $preview[0].Status -eq 'WhatIf') 'WhatIf must report both users'
    Assert ($global:ImportTestCalls.Count -eq 0) 'WhatIf must never call mutation cmdlets'

    $results = @(& $solution -CsvPath $csvPath -Server 'dc.lab.local' -InitialPassword $password -InformationVariable liveReport | ForEach-Object {
        if ($_.Status -eq 'Failed') { Write-Host $_.Details }
        $_
    })
    Assert (@($results | Where-Object Status -eq 'Created').Count -eq 2) 'Both users must be created'
    Assert ($results.Count -eq 2) 'Console report must not pollute the CSV result stream'
    Assert (($liveReport -join "`n") -match 'users/s\s+\|\s+Sample: 2') 'Benchmark must include successful sample size'
    Assert (($liveReport -join "`n") -match 'Group additions\s+4') 'Summary must count successful group operations'
    Assert (($liveReport -join "`n") -match 'Average / P95') 'Summary must show latency distribution'
    Assert ($global:ImportTestCalls.Count -eq 12) 'Expected create, password, change flag, two groups, enable for each user'
    Assert ($global:ImportTestCalls[5] -like 'Enable:*' -and $global:ImportTestCalls[11] -like 'Enable:*') 'Enable must be last'
    $global:ImportTestCalls.Clear()
    $rerun = @(& $solution -CsvPath $csvPath -Server 'dc.lab.local' -InitialPassword $password)
    Assert (@($rerun | Where-Object Status -eq 'SkippedExisting').Count -eq 2) 'Rerun must skip existing accounts'
    Assert ($global:ImportTestCalls.Count -eq 0) 'Rerun must not reset passwords or groups'

    $global:ImportTestStore = @{}
    $rows[1].TargetOU = 'OU=Missing,DC=lab,DC=local'
    $rows | Export-Csv -LiteralPath $csvPath -Delimiter ';' -Encoding UTF8 -NoTypeInformation
    $caught = $false
    try { & $solution -CsvPath $csvPath -Server 'dc.lab.local' -InitialPassword $password -InformationVariable invalidReport | Out-Null }
    catch { $caught = $_.Exception.Message -like 'Preflight failed*' }
    Assert ($caught -and $global:ImportTestCalls.Count -eq 0) 'A bad second row must stop ALL mutations'
    Assert (($invalidReport -join "`n") -match 'Not processed\s+2') 'Preflight failure must report unprocessed rows'
    $rows[1].TargetOU = $rows[0].TargetOU

    $rows | Export-Csv -LiteralPath $csvPath -Delimiter ',' -Encoding UTF8 -NoTypeInformation
    $comma = @(& $solution -CsvPath $csvPath -Delimiter ',' -Server 'dc.lab.local' -WhatIf)
    Assert ($comma.Count -eq 2) 'Comma CSV must be supported'
    $caught = $false
    try { & $solution -CsvPath $csvPath -Server 'dc.lab.local' -WhatIf | Out-Null }
    catch { $caught = $_.Exception.Message -like 'Missing CSV column*' }
    Assert $caught 'Incorrect separator must be rejected'

    $rows | Export-Csv -LiteralPath $csvPath -Delimiter ';' -Encoding UTF8 -NoTypeInformation
    $global:ImportTestFailGroups = $true
    $caught = $false
    try { & $solution -CsvPath $csvPath -Server 'dc.lab.local' -InitialPassword $password -InformationVariable failedReport | Out-Null }
    catch { $caught = $_.Exception.Message -like '*employee(s) failed*' }
    Assert $caught 'Runtime failures must produce a failing result'
    Assert (($failedReport -join "`n") -match 'STOPPED / ACTION REQUIRED') 'Failed run must show an actionable summary'
    Assert (($failedReport -join "`n") -match 'Failed\s+2') 'Summary must count failed accounts'
    Assert (@($global:ImportTestCalls | Where-Object { $_ -like 'Enable:*' }).Count -eq 0) 'Failed users must never be enabled'
    Write-Output 'PASS: WhatIf, creation order, group mapping, rerun, full-batch validation, separators and partial failure.'
} finally {
    if (Test-Path -LiteralPath $csvPath) { Remove-Item -LiteralPath $csvPath }
    Remove-Item -LiteralPath $directory
}
