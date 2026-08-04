<#
.SYNOPSIS
  Fase 2 — installer Windows-roller (idempotent).

.PARAMETER WhatIf
  Vis hvad der ville ske uden at installere.
#>
[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [string]$ConfigPath = (Join-Path $PSScriptRoot 'Config.psd1')
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Common.ps1')

Assert-Administrator
$config = Get-BootstrapConfig -ConfigPath $ConfigPath

Write-BootstrapStep 'Fase 02 — Installér roller'

$restartNeeded = $false

foreach ($rolle in $config.Roles) {
    $feature = Get-WindowsFeature -Name $rolle -ErrorAction Stop
    if ($feature.InstallState -eq 'Installed') {
        Write-BootstrapStep "$rolle er allerede installeret" -Level Skip
        continue
    }

    if ($PSCmdlet.ShouldProcess($rolle, 'Install-WindowsFeature')) {
        Write-BootstrapStep "Installerer $rolle ..."
        $result = Install-WindowsFeature -Name $rolle -IncludeManagementTools
        if ($result.Success) {
            Write-BootstrapStep "$rolle installeret" -Level Ok
            if ($result.RestartNeeded -eq 'Yes') {
                $restartNeeded = $true
            }
        }
        else {
            Write-BootstrapStep "$rolle fejlede (ExitCode=$($result.ExitCode))" -Level Error
            throw "Install-WindowsFeature fejlede for $rolle"
        }
    }
}

Get-WindowsFeature |
    Where-Object { $_.Name -in $config.Roles -and $_.InstallState -eq 'Installed' } |
    Select-Object Name, DisplayName, InstallState |
    Format-Table -AutoSize

if ($restartNeeded) {
    Write-BootstrapStep 'Genstart anbefales før fase 03 (Promote)' -Level Warn
}

Write-BootstrapStep 'Fase 02 færdig' -Level Ok
