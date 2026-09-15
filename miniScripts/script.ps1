[CmdletBinding()]
param([ValidateSet('Menu', 'Regn', 'Race', 'Spaakugle', 'fniselise')][string]$Demo = 'Menu')

function Start-Demo {
    param([string]$Name)
    switch ($Name) {
        'Regn' { & "$PSScriptRoot\demos\digital-regn.ps1" }
        'Race' { & "$PSScriptRoot\demos\raket-race.ps1" }
        'Spaakugle' { & "$PSScriptRoot\demos\spaakugle.ps1" }
        'fniselise' { & "$PSScriptRoot\demos\fniselise.ps1" }
    }
}

if ($Demo -ne 'Menu') { Start-Demo $Demo; return }
do {
    Write-Host "`n=== POWERSHELL LEGEPLADS ===" -ForegroundColor Cyan
    Write-Host "Velkommen om bord på $env:COMPUTERNAME"
    Write-Host "1. Digital regn`n2. Raketkapløb`n3. Spåkugle`nQ. Afslut"
    $choice = Read-Host 'Vælg en demo'
    switch ($choice) {
        '1' { Start-Demo Regn }
        '2' { Start-Demo Race }
        '3' { Start-Demo Spaakugle }
        'fniselise' { Start-Demo fniselise }
        'q' { }
        default { Write-Host 'Prøv 1, 2, 3 eller Q.' -ForegroundColor Yellow }
    }
} while ($choice -ne 'q')



# Kommando til at køre scriptet i terminalen
# .\script.ps1
