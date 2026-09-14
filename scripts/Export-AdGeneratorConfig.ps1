#requires -Version 5.1
<#
.SYNOPSIS
Read-only AD inventory for the CSV generator. Run in Windows PowerShell 5.1
on a domain controller or a domain-joined PC with the AD and GroupPolicy RSAT tools.
Only the local JSON file is written. No AD objects or permissions are changed.
.EXAMPLE
.\Export-AdGeneratorConfig.ps1 -OutputPath .\ad-config.json
#>
[CmdletBinding()]
param([string]$OutputPath = '.\ad-config.json')

$ErrorActionPreference = 'Stop'
Import-Module ActiveDirectory -ErrorAction Stop
$domain = Get-ADDomain
$server = $domain.PDCEmulator
$warnings = [System.Collections.Generic.List[string]]::new()
$ous = @(Get-ADOrganizationalUnit -Filter * -Server $server | Sort-Object DistinguishedName)
$groups = @(Get-ADGroup -Filter 'GroupCategory -eq "Security"' -Properties Description, adminCount -Server $server | Sort-Object SamAccountName)
$users = @(Get-ADUser -Filter * -Properties Title, Department, Company, MemberOf -Server $server)
$groupLookup = @{}
foreach ($group in $groups) { $groupLookup[$group.DistinguishedName] = $group }

# GroupPolicy is optional: partial exports explicitly report missing information.
$hasGpo = $false
try { Import-Module GroupPolicy -ErrorAction Stop; $hasGpo = $true }
catch { $warnings.Add('GroupPolicy module unavailable. GPO information was not exported.') }

$ouRecords = @(foreach ($ou in $ous) {
    $gpoNames = @()
    if ($hasGpo) {
        try {
            $inheritance = Get-GPInheritance -Target $ou.DistinguishedName -Domain $domain.DNSRoot -Server $server
            $gpoNames = @($inheritance.InheritedGpoLinks | Where-Object { $_.Enabled } | Select-Object -ExpandProperty DisplayName -Unique)
        }
        catch { $warnings.Add("GPO information unavailable for $($ou.DistinguishedName): $($_.Exception.Message)") }
    }
    [ordered]@{ name = [string]$ou.Name; dn = [string]$ou.DistinguishedName; gpos = @($gpoNames) }
})

function Test-ReviewOnlyGroup($Group) {
    # Built-in/default groups and protected groups are inventoried but are not
    # automatically suggested for new employees. This is not a privilege audit.
    return ($Group.adminCount -eq 1 -or [int](($Group.SID.Value -split '-')[-1]) -lt 1000)
}

# Infer roles from enabled accounts sharing Title, Department and exact parent OU.
# No real display names, email addresses or individual memberships enter the file.
$ouLookup = @{}
foreach ($ou in $ous) { $ouLookup[$ou.DistinguishedName] = $ou }
$buckets = @{}
$skipped = 0
foreach ($user in $users) {
    if (-not $user.Enabled) { continue }
    # Match one complete RDN, including escaped commas/backslashes in the CN.
    $parent = $user.DistinguishedName -replace '^(?:\\.|[^,\\])+,', ''
    if (-not $ouLookup.ContainsKey($parent)) { $skipped++; continue }
    $title = [string]$user.Title
    $department = [string]$user.Department
    if ([string]::IsNullOrWhiteSpace($title)) { $title = 'Employee' }
    if ([string]::IsNullOrWhiteSpace($department)) { $department = $ouLookup[$parent].Name }
    $key = ConvertTo-Json -InputObject @($title, $department, $parent) -Compress
    $memberships = @($user.MemberOf | Where-Object { $groupLookup.ContainsKey($_) } | ForEach-Object {
        $g = $groupLookup[$_]
        if (-not (Test-ReviewOnlyGroup $g)) { [string]$g.SamAccountName }
    })
    if (-not $buckets.ContainsKey($key)) {
        $buckets[$key] = [ordered]@{ title = $title; department = $department; ou = $parent; groups = @($memberships) }
    }
    else {
        # Only direct security memberships common to ALL accounts in this role.
        $buckets[$key].groups = @($buckets[$key].groups | Where-Object { $memberships -contains $_ })
    }
}
if ($skipped) { $warnings.Add("$skipped enabled accounts outside an OU were omitted from role suggestions. Their usernames are still reserved.") }

$inventory = [ordered]@{
    schemaVersion = 1
    domain = [string]$domain.DNSRoot
    companies = @($users | ForEach-Object { if ($_.Company) { [string]$_.Company } } | Sort-Object -Unique)
    ous = @($ouRecords)
    groups = @(foreach ($group in $groups) {
        [ordered]@{ name = [string]$group.SamAccountName; description = [string]$group.Description; reviewOnly = [bool](Test-ReviewOnlyGroup $group) }
    })
    roles = @($buckets.Values | Sort-Object { $_.ou }, { $_.title }, { $_.department })
    reservedUsernames = @($users | Select-Object -ExpandProperty SamAccountName | Sort-Object -Unique)
    warnings = @($warnings.ToArray())
}
# Format tokens rather than replacing whitespace inside JSON string values.
# This keeps Windows PowerShell 5.1 output readable with two-space indentation,
# compact empty arrays and unchanged AD names, paths and descriptions.
function Format-InventoryJson([string]$Json) {
    $tokens = [regex]::Matches($Json, '"(?:\\.|[^"\\])*"|[{}\[\],:]|[^{}\[\],:\s]+')
    $builder = [System.Text.StringBuilder]::new()
    $depth = 0
    for ($i = 0; $i -lt $tokens.Count; $i++) {
        $token = $tokens[$i].Value
        switch ($token) {
            { $_ -eq '{' -or $_ -eq '[' } {
                [void]$builder.Append($token)
                $closing = if ($token -eq '{') { '}' } else { ']' }
                if ($i + 1 -lt $tokens.Count -and $tokens[$i + 1].Value -eq $closing) {
                    [void]$builder.Append($closing)
                    $i++
                } else {
                    $depth++
                    [void]$builder.Append("`r`n" + ('  ' * $depth))
                }
            }
            { $_ -eq '}' -or $_ -eq ']' } {
                $depth--
                [void]$builder.Append("`r`n" + ('  ' * $depth) + $token)
            }
            ',' { [void]$builder.Append(",`r`n" + ('  ' * $depth)) }
            ':' { [void]$builder.Append(': ') }
            default { [void]$builder.Append($token) }
        }
    }
    return $builder.ToString() + "`r`n"
}
$json = Format-InventoryJson (ConvertTo-Json -InputObject $inventory -Depth 8 -Compress)
$path = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($OutputPath)
[System.IO.File]::WriteAllText($path, $json, [System.Text.UTF8Encoding]::new($true))
Write-Host "Exported $($ous.Count) OUs, $($groups.Count) security groups and $($buckets.Count) role suggestions to $path"
foreach ($warning in $warnings) { Write-Warning $warning }
