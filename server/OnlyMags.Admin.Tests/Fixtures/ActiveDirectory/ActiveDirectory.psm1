# Test double only. Loaded exclusively by the test runner's PSModulePath.
$ErrorActionPreference = 'Stop'
function Read-Store {
    if (Test-Path -LiteralPath $env:ONLYMAGS_TEST_STORE) {
        $stored = Get-Content -LiteralPath $env:ONLYMAGS_TEST_STORE -Raw | ConvertFrom-Json
        foreach ($entry in $stored) { $entry }
    }
}
function Save-Store($Users) { ConvertTo-Json -InputObject @($Users) | Set-Content -LiteralPath $env:ONLYMAGS_TEST_STORE -Encoding UTF8 }
function Get-ADDomain { param($Server) [pscustomobject]@{ DNSRoot = 'lab.local'; DistinguishedName = 'DC=lab,DC=local' } }
function Get-ADOrganizationalUnit { param($Identity, $Server) [pscustomobject]@{ DistinguishedName = $Identity } }
function Get-ADGroup { param($Identity, $Server) [pscustomobject]@{ DistinguishedName = "CN=$Identity,DC=lab,DC=local"; GroupCategory = 'Security' } }
function Get-ADObject {
    param($LDAPFilter, $Identity, $Properties, $Server)
    foreach ($user in (Read-Store)) {
        if (($Identity -and $user.ObjectGUID -eq $Identity.ToString()) -or ($LDAPFilter -and $LDAPFilter.Contains("sAMAccountName=$($user.SamAccountName)"))) { $user }
    }
}
function New-ADUser {
    param($Name, $SamAccountName, $UserPrincipalName, $GivenName, $Surname, $DisplayName, $EmployeeID, $Company, $Department, $Title, $Path, $Enabled, $Server, $PassThru, $ErrorAction)
    if ($Enabled) { throw 'Must start disabled' }
    $user = [pscustomobject]@{ ObjectGUID = [guid]::NewGuid().ToString(); ObjectClass = 'user'; SamAccountName = $SamAccountName;
        UserPrincipalName = $UserPrincipalName; EmployeeID = $EmployeeID; DistinguishedName = "CN=$Name,$Path" }
    Save-Store (@(Read-Store) + $user)
    $user
}
function Set-ADAccountPassword {
    param($Identity, [switch]$Reset, $NewPassword, $Server, $ErrorAction)
    if ($NewPassword -isnot [Security.SecureString]) { throw 'Password must be secure' }
}
function Set-ADUser { param($Identity, $ChangePasswordAtLogon, $Server, $ErrorAction) }
function Add-ADGroupMember { param($Identity, $Members, $Server, $ErrorAction) if ($Server -eq 'fail.lab.local') { throw 'Simulated group failure' } }
function Enable-ADAccount { param($Identity, $Server, $ErrorAction) }
function Remove-ADUser {
    param($Identity, $Server, $Confirm, $ErrorAction)
    if ($Identity -isnot [guid]) { throw 'Delete by GUID only' }
    Save-Store @(Read-Store | Where-Object { $_.ObjectGUID -ne $Identity.ToString() })
}
Export-ModuleMember -Function Get-ADDomain,Get-ADOrganizationalUnit,Get-ADGroup,Get-ADObject,New-ADUser,Set-ADAccountPassword,Set-ADUser,Add-ADGroupMember,Enable-ADAccount,Remove-ADUser
