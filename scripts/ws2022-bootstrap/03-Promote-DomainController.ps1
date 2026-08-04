<#
.SYNOPSIS
  Fase 3 - promote server til ny AD DS forest (kræver genstart).

.DESCRIPTION
  Install-ADDSForest. DSRM-password indtastes interaktivt (SecureString).
  Efter success genstarter serveren automatisk (medmindre -NoRebootOnCompletion).

.PARAMETER SafeModeAdministratorPassword
  Valgfri SecureString. Hvis udeladt, prompts der.

.PARAMETER NoRebootOnCompletion
  Undlad automatisk genstart (til avanceret lab-brug).
#>
[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [string]$ConfigPath = (Join-Path $PSScriptRoot 'Config.psd1'),

    [SecureString]$SafeModeAdministratorPassword,

    [switch]$NoRebootOnCompletion
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Common.ps1')

Assert-Administrator
$config = Get-BootstrapConfig -ConfigPath $ConfigPath

Write-BootstrapStep "Fase 03 - Promote til DC ($($config.DomainName))"

# Allerede domænemedlem / DC?
$cs = Get-CimInstance Win32_ComputerSystem
if ($cs.PartOfDomain -or $cs.DomainRole -ge 4) {
    Write-BootstrapStep "Server er allerede i domæne/rolle ($($cs.Domain), DomainRole=$($cs.DomainRole))" -Level Skip
    Write-BootstrapStep 'Springer promotion over - kør fase 04 efter reboot hvis nødvendigt' -Level Warn
    return
}

$adFeature = Get-WindowsFeature -Name 'AD-Domain-Services'
if ($adFeature.InstallState -ne 'Installed') {
    throw 'AD-Domain-Services er ikke installeret. Kør 02-Install-Roles.ps1 først.'
}

Import-Module ADDSDeployment -ErrorAction Stop

if (-not $SafeModeAdministratorPassword) {
    $SafeModeAdministratorPassword = Read-Host -AsSecureString -Prompt 'DSRM / Safe Mode Administrator Password'
}

$params = @{
    DomainName                    = $config.DomainName
    DomainNetbiosName             = $config.DomainNetbiosName
    ForestMode                    = $config.ForestMode
    DomainMode                    = $config.DomainMode
    SafeModeAdministratorPassword = $SafeModeAdministratorPassword
    InstallDns                    = $true
    CreateDnsDelegation           = $false
    DatabasePath                  = 'C:\Windows\NTDS'
    LogPath                       = 'C:\Windows\NTDS'
    SysvolPath                    = 'C:\Windows\SYSVOL'
    NoRebootOnCompletion          = [bool]$NoRebootOnCompletion
    Force                         = $true
}

if ($PSCmdlet.ShouldProcess($config.DomainName, 'Install-ADDSForest')) {
    Write-BootstrapStep 'Starter Install-ADDSForest - server genstarter typisk bagefter' -Level Warn
    Install-ADDSForest @params
    Write-BootstrapStep 'Promotion anmodet. Efter reboot: kør fase 04 og 05.' -Level Ok
}
else {
    Write-BootstrapStep 'WhatIf: Install-ADDSForest ville oprette forest' -Level Skip
    Write-Host ($params | Select-Object DomainName, DomainNetbiosName, ForestMode, DomainMode, InstallDns | Format-List | Out-String)
}

Write-BootstrapStep 'Fase 03 færdig (vent på genstart før fase 04)' -Level Ok
