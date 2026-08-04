<#
.SYNOPSIS
  Fase 1 — forbered host (hostname, timezone, valgfrit netværk).

.PARAMETER WhatIf
  Vis hvad der ville ske uden at ændre systemet.
#>
[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [string]$ConfigPath = (Join-Path $PSScriptRoot 'Config.psd1')
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Common.ps1')

Assert-Administrator
$config = Get-BootstrapConfig -ConfigPath $ConfigPath

Write-BootstrapStep "Fase 01 — Prepare host ($($config.ComputerName))"

# Timezone
$tz = Get-TimeZone
if ($tz.Id -eq $config.TimeZoneId) {
    Write-BootstrapStep "Timezone allerede $($config.TimeZoneId)" -Level Skip
}
elseif ($PSCmdlet.ShouldProcess($config.TimeZoneId, 'Set-TimeZone')) {
    Set-TimeZone -Id $config.TimeZoneId
    Write-BootstrapStep "Timezone sat til $($config.TimeZoneId)" -Level Ok
}

# Hostname
$currentName = $env:COMPUTERNAME
if ($currentName -ieq $config.ComputerName) {
    Write-BootstrapStep "Hostname allerede $($config.ComputerName)" -Level Skip
}
elseif ($PSCmdlet.ShouldProcess($config.ComputerName, 'Rename-Computer')) {
    Rename-Computer -NewName $config.ComputerName -Force
    Write-BootstrapStep "Hostname sat til $($config.ComputerName) — genstart anbefales før næste fase" -Level Warn
}

# Netværk (valgfrit)
if (-not $config.ConfigureNetwork) {
    Write-BootstrapStep 'ConfigureNetwork = $false — springer netværk over' -Level Skip
}
else {
    $adapter = Get-NetAdapter -Name $config.InterfaceAlias -ErrorAction SilentlyContinue
    if (-not $adapter) {
        Write-BootstrapStep "Adapter '$($config.InterfaceAlias)' findes ikke — tjek Config.psd1" -Level Error
        throw "Netværksadapter ikke fundet: $($config.InterfaceAlias)"
    }

    $existing = Get-NetIPAddress -InterfaceAlias $config.InterfaceAlias -AddressFamily IPv4 -ErrorAction SilentlyContinue |
        Where-Object IPAddress -eq $config.IPv4Address

    if ($existing) {
        Write-BootstrapStep "IPv4 $($config.IPv4Address) allerede konfigureret" -Level Skip
    }
    elseif ($PSCmdlet.ShouldProcess($config.IPv4Address, 'New-NetIPAddress')) {
        # Fjern eksisterende DHCP/IPv4 på adapteren for at undgå konflikter
        Get-NetIPAddress -InterfaceAlias $config.InterfaceAlias -AddressFamily IPv4 -ErrorAction SilentlyContinue |
            Where-Object PrefixOrigin -ne 'WellKnown' |
            Remove-NetIPAddress -Confirm:$false -ErrorAction SilentlyContinue

        Get-NetRoute -InterfaceAlias $config.InterfaceAlias -AddressFamily IPv4 -ErrorAction SilentlyContinue |
            Where-Object DestinationPrefix -eq '0.0.0.0/0' |
            Remove-NetRoute -Confirm:$false -ErrorAction SilentlyContinue

        New-NetIPAddress `
            -InterfaceAlias $config.InterfaceAlias `
            -IPAddress $config.IPv4Address `
            -PrefixLength $config.PrefixLength `
            -DefaultGateway $config.DefaultGateway | Out-Null

        Set-DnsClientServerAddress `
            -InterfaceAlias $config.InterfaceAlias `
            -ServerAddresses $config.DnsServers

        Write-BootstrapStep "IPv4 $($config.IPv4Address)/$($config.PrefixLength) konfigureret" -Level Ok
    }
}

Write-BootstrapStep 'Fase 01 færdig' -Level Ok
