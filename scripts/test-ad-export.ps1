param([Parameter(Mandatory = $true)][string]$OutputPath, [switch]$WithoutGroupPolicy, [switch]$FailedGpoRead)
$ErrorActionPreference = 'Stop'

# Run the actual exporter against deterministic AD cmdlet doubles. No AD is queried.
function Import-Module {
    param($Name, $ErrorAction)
    if ($Name -eq 'GroupPolicy' -and $WithoutGroupPolicy) { throw 'Mock: GroupPolicy not installed' }
}
function Get-ADDomain { [pscustomobject]@{ DNSRoot = 'skole.local'; PDCEmulator = 'dc01.skole.local' } }
function Get-ADOrganizationalUnit {
    param($Filter, $Server)
    [pscustomobject]@{ Name = 'Økonomi'; DistinguishedName = 'OU=Økonomi,DC=skole,DC=local' }
    [pscustomobject]@{ Name = 'IT'; DistinguishedName = 'OU=IT,DC=skole,DC=local' }
}
function Get-ADGroup {
    param($Filter, $Properties, $Server)
    foreach ($entry in @(
        @{ Name = 'GG_Faelles'; Rid = 1101; Protected = 0 },
        @{ Name = 'GG_Projekt'; Rid = 1102; Protected = 0 },
        @{ Name = 'Beskyttet'; Rid = 1103; Protected = 1 },
        @{ Name = 'Domain Admins'; Rid = 512; Protected = 1 }
    )) {
        [pscustomobject]@{ SamAccountName = $entry.Name; DistinguishedName = "CN=$($entry.Name),DC=skole,DC=local"; Description = 'Adgang til fællesdrev'; adminCount = $entry.Protected; SID = [pscustomobject]@{ Value = "S-1-5-21-123-456-789-$($entry.Rid)" } }
    }
}
function Get-ADUser {
    param($Filter, $Properties, $Server)
    [pscustomobject]@{ SamAccountName = 'anna.jensen'; Enabled = $true; DistinguishedName = 'CN=Jensen\, Anna,OU=Økonomi,DC=skole,DC=local'; Title = 'Bogholder'; Department = 'Økonomi'; Company = 'Æble A/S'; MemberOf = @('CN=GG_Faelles,DC=skole,DC=local', 'CN=GG_Projekt,DC=skole,DC=local', 'CN=Domain Admins,DC=skole,DC=local', 'CN=Beskyttet,DC=skole,DC=local') }
    [pscustomobject]@{ SamAccountName = 'bo.hansen'; Enabled = $true; DistinguishedName = 'CN=Bo,OU=Økonomi,DC=skole,DC=local'; Title = 'Bogholder'; Department = 'Økonomi'; Company = 'Æble A/S'; MemberOf = @('CN=GG_Faelles,DC=skole,DC=local', 'CN=Domain Admins,DC=skole,DC=local', 'CN=Beskyttet,DC=skole,DC=local') }
    [pscustomobject]@{ SamAccountName = 'disabled.user'; Enabled = $false; DistinguishedName = 'CN=Disabled,OU=IT,DC=skole,DC=local'; Title = ''; Department = ''; Company = ''; MemberOf = @() }
    [pscustomobject]@{ SamAccountName = 'container.user'; Enabled = $true; DistinguishedName = 'CN=Container,CN=Users,DC=skole,DC=local'; Title = ''; Department = ''; Company = ''; MemberOf = @() }
}
function Get-GPInheritance {
    param($Target, $Domain, $Server)
    if ($FailedGpoRead -and $Target -like 'OU=IT,*') { throw 'Mock: cannot read GPO inheritance' }
    [pscustomobject]@{ InheritedGpoLinks = @(
        [pscustomobject]@{ Enabled = $true; DisplayName = 'GPO_Basis' },
        [pscustomobject]@{ Enabled = $false; DisplayName = 'GPO_Disabled' }
    ) }
}

. (Join-Path $PSScriptRoot 'Export-AdGeneratorConfig.ps1') -OutputPath $OutputPath
if (-not (Test-Path -LiteralPath $OutputPath)) { throw 'Exporter did not write JSON' }

$edgeCases = [ordered]@{
    text = "Økonomi `"quoted`", {object}: [array] \\server\share`nnext line"
    emptyArray = @()
    emptyObject = @{}
    flags = @($true, $false, $null, 12.5)
}
$formatted = Format-InventoryJson (ConvertTo-Json -InputObject $edgeCases -Depth 8 -Compress)
$roundTrip = $formatted | ConvertFrom-Json
if ($roundTrip.text -cne $edgeCases.text -or $roundTrip.emptyArray.Count -ne 0 -or $roundTrip.flags.Count -ne 4) {
    throw 'JSON formatting changed values or array structure'
}
if ($formatted -notmatch '"emptyArray": \[\]' -or $formatted -notmatch '"emptyObject": \{\}') {
    throw 'Empty collections must be compact'
}
