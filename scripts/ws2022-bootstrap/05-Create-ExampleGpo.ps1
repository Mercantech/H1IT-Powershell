<#
.SYNOPSIS
  Fase 5 — opret eksempel-GPO, link til OU og sæt én registry-policy.
#>
[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [string]$ConfigPath = (Join-Path $PSScriptRoot 'Config.psd1')
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Common.ps1')

Assert-Administrator
$config = Get-BootstrapConfig -ConfigPath $ConfigPath

Write-BootstrapStep "Fase 05 — GPO ($($config.GpoName))"

Import-Module GroupPolicy -ErrorAction Stop
Import-Module ActiveDirectory -ErrorAction Stop

$gpo = Get-GPO -Name $config.GpoName -ErrorAction SilentlyContinue
if ($gpo) {
    Write-BootstrapStep "GPO '$($config.GpoName)' findes allerede" -Level Skip
}
elseif ($PSCmdlet.ShouldProcess($config.GpoName, 'New-GPO')) {
    $gpo = New-GPO -Name $config.GpoName -Comment 'Lab baseline fra ws2022-bootstrap'
    Write-BootstrapStep "GPO '$($config.GpoName)' oprettet" -Level Ok
}

$ouDn = Get-OuDn -OuName $config.GpoLinkOuName -DomainName $config.DomainName
$ou = Get-ADOrganizationalUnit -Identity $ouDn -ErrorAction Stop

$existingLink = (Get-GPInheritance -Target $ouDn).GpoLinks |
    Where-Object DisplayName -eq $config.GpoName

if ($existingLink) {
    Write-BootstrapStep "GPO allerede linket til OU $($config.GpoLinkOuName)" -Level Skip
}
elseif ($PSCmdlet.ShouldProcess($ouDn, 'New-GPLink')) {
    New-GPLink -Name $config.GpoName -Target $ouDn -LinkEnabled Yes | Out-Null
    Write-BootstrapStep "GPO linket til $ouDn" -Level Ok
}

# Én simpel, dokumenteret indstilling (User Configuration via registry)
if ($PSCmdlet.ShouldProcess($config.GpoRegistryValueName, 'Set-GPRegistryValue')) {
    Set-GPRegistryValue `
        -Name $config.GpoName `
        -Key $config.GpoRegistryPath `
        -ValueName $config.GpoRegistryValueName `
        -Type $config.GpoRegistryType `
        -Value $config.GpoRegistryValue | Out-Null

    Write-BootstrapStep "Registry-policy sat: $($config.GpoRegistryPath)\$($config.GpoRegistryValueName)=$($config.GpoRegistryValue)" -Level Ok
}

Get-GPO -Name $config.GpoName | Select-Object DisplayName, Id, ModificationTime | Format-List
Write-BootstrapStep 'Fase 05 færdig — bootstrap komplet' -Level Ok
