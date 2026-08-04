<#
.SYNOPSIS
  Orchestrator for modulært WS 2022-bootstrap (lab).

.DESCRIPTION
  Kører faser 01–05. Efter fase 03 (AD DS promotion) genstarter serveren typisk —
  kør derefter igen med -Phase 4 (eller -FromPhase 4 -All).

.PARAMETER Phase
  Kør én fase: 1–5.

.PARAMETER All
  Kør alle faser i rækkefølge (stopper før 04 hvis server ikke er DC endnu).

.PARAMETER FromPhase
  Start fra angivet fase når -All bruges (standard 1).

.PARAMETER WhatIf
  Dry-run via SupportsShouldProcess på underliggende scripts.

.EXAMPLE
  .\Invoke-Bootstrap.ps1 -Phase 1 -WhatIf

.EXAMPLE
  .\Invoke-Bootstrap.ps1 -All

.EXAMPLE
  # Efter reboot som DC:
  .\Invoke-Bootstrap.ps1 -FromPhase 4 -All
#>
[CmdletBinding(SupportsShouldProcess = $true, DefaultParameterSetName = 'All')]
param(
    [Parameter(ParameterSetName = 'Single', Mandatory)]
    [ValidateRange(1, 5)]
    [int]$Phase,

    [Parameter(ParameterSetName = 'All')]
    [switch]$All,

    [Parameter(ParameterSetName = 'All')]
    [ValidateRange(1, 5)]
    [int]$FromPhase = 1,

    [string]$ConfigPath = (Join-Path $PSScriptRoot 'Config.psd1'),

    [string]$TranscriptPath
)

$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'Common.ps1')

Assert-Administrator

if (-not $All -and -not $PSBoundParameters.ContainsKey('Phase')) {
    $All = $true
}

$phaseMap = @{
    1 = '01-Prepare-Host.ps1'
    2 = '02-Install-Roles.ps1'
    3 = '03-Promote-DomainController.ps1'
    4 = '04-Configure-ADStructure.ps1'
    5 = '05-Create-ExampleGpo.ps1'
}

function Test-IsDomainController {
    $role = (Get-CimInstance Win32_ComputerSystem).DomainRole
    # 4 = Backup DC, 5 = Primary DC
    return ($role -ge 4)
}

function Invoke-BootstrapPhase {
    param([int]$Number)

    $scriptName = $phaseMap[$Number]
    $scriptPath = Join-Path $PSScriptRoot $scriptName
    if (-not (Test-Path -LiteralPath $scriptPath)) {
        throw "Mangler script: $scriptPath"
    }

    Write-BootstrapStep "=== Starter fase $Number ($scriptName) ==="

    $args = @{
        ConfigPath = $ConfigPath
    }
    if ($WhatIfPreference) {
        $args['WhatIf'] = $true
    }

    & $scriptPath @args
}

if (-not $TranscriptPath) {
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $TranscriptPath = Join-Path $PSScriptRoot "logs\\bootstrap-$stamp.txt"
}

$logDir = Split-Path -Parent $TranscriptPath
if (-not (Test-Path -LiteralPath $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

Start-Transcript -Path $TranscriptPath -Append | Out-Null
Write-BootstrapStep "Transcript: $TranscriptPath"

try {
    if ($PSCmdlet.ParameterSetName -eq 'Single') {
        if ($Phase -ge 4 -and -not (Test-IsDomainController)) {
            throw "Fase $Phase kræver at serveren er domain controller. Kør fase 3 og genstart først."
        }
        Invoke-BootstrapPhase -Number $Phase
    }
    else {
        for ($n = $FromPhase; $n -le 5; $n++) {
            if ($n -eq 4 -and -not (Test-IsDomainController)) {
                Write-BootstrapStep 'Server er endnu ikke DC — stopper før fase 04.' -Level Warn
                Write-BootstrapStep 'Efter Install-ADDSForest og reboot: .\Invoke-Bootstrap.ps1 -FromPhase 4 -All' -Level Warn
                break
            }
            Invoke-BootstrapPhase -Number $n

            if ($n -eq 3 -and -not $WhatIfPreference) {
                Write-BootstrapStep 'Fase 03 typisk udløser genstart. Genoptag med -FromPhase 4 -All.' -Level Warn
                break
            }
        }
    }

    Write-BootstrapStep 'Orchestrator færdig' -Level Ok
}
finally {
    Stop-Transcript | Out-Null
}
