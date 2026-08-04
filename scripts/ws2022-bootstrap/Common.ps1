<#
.SYNOPSIS
  Fælles hjælpefunktioner til ws2022-bootstrap.
#>

function Get-BootstrapConfig {
    [CmdletBinding()]
    param(
        [string]$ConfigPath = (Join-Path $PSScriptRoot 'Config.psd1')
    )

    if (-not (Test-Path -LiteralPath $ConfigPath)) {
        throw "Config ikke fundet: $ConfigPath"
    }

    return Import-PowerShellDataFile -Path $ConfigPath
}

function Write-BootstrapStep {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$Message,

        [ValidateSet('Info', 'Ok', 'Skip', 'Warn', 'Error')]
        [string]$Level = 'Info'
    )

    $color = switch ($Level) {
        'Ok'    { 'Green' }
        'Skip'  { 'Yellow' }
        'Warn'  { 'Magenta' }
        'Error' { 'Red' }
        default { 'Cyan' }
    }

    $prefix = switch ($Level) {
        'Ok'    { '[OK]' }
        'Skip'  { '[SKIP]' }
        'Warn'  { '[WARN]' }
        'Error' { '[ERROR]' }
        default { '[INFO]' }
    }

    Write-Host "$prefix $Message" -ForegroundColor $color
}

function Test-IsAdministrator {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = [Security.Principal.WindowsPrincipal]$identity
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Assert-Administrator {
    if (-not (Test-IsAdministrator)) {
        throw 'Kør PowerShell som Administrator.'
    }
}

function Get-DomainDn {
    param([Parameter(Mandatory)][string]$DomainName)

    return ($DomainName -split '\.' | ForEach-Object { "DC=$_" }) -join ','
}

function Get-OuDn {
    param(
        [Parameter(Mandatory)][string]$OuName,
        [Parameter(Mandatory)][string]$DomainName
    )

    $domainDn = Get-DomainDn -DomainName $DomainName
    return "OU=$OuName,$domainDn"
}
