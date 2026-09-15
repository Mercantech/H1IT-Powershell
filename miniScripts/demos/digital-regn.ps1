# Matrix-inspireret terminalshow. Ctrl+C stopper demoen.
[CmdletBinding()]
param(
    [ValidateRange(1, 1000)][int]$Lines = 65,
    [ValidateRange(0, 1000)][int]$DelayMs = 55
)
$alphabet = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&'.ToCharArray()
$width = 70
try {
    if ($Host.UI.RawUI.WindowSize.Width -gt 1) {
        $width = [Math]::Min(70, $Host.UI.RawUI.WindowSize.Width - 1)
    }
} catch { } # Standardbredde i hosts uden terminalvindue.
Write-Host "`nSIGNAL FUNDET..." -ForegroundColor DarkGreen
for ($line = 0; $line -lt $Lines; $line++) {
    $rain = -join $(for ($column = 0; $column -lt $width; $column++) {
        if ((Get-Random -Minimum 0 -Maximum 100) -lt 45) { ' ' }
        else { $alphabet[(Get-Random -Minimum 0 -Maximum $alphabet.Length)] }
    })
    $color = if ($line % 7 -eq 0) { 'Green' } else { 'DarkGreen' }
    Write-Host $rain -ForegroundColor $color
    Start-Sleep -Milliseconds $DelayMs
}
Write-Host 'Du er stadig i PowerShell. Bare rolig.' -ForegroundColor Green
