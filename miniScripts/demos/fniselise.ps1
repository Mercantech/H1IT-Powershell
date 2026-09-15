# Hemmelig cookie-fest! Ctrl+C afbryder animationen.
[CmdletBinding()]
param(
    [ValidateRange(1, 500)][int]$Frames = 90,
    [ValidateRange(0, 1000)][int]$DelayMs = 65
)

# UTF-8 med BOM gør også denne fil læsbar i Windows PowerShell 5.1.
$width = 72
try {
    if ($Host.UI.RawUI.WindowSize.Width -gt 1) {
        $width = [Math]::Min($width, $Host.UI.RawUI.WindowSize.Width - 1)
    }
} catch { }
$columns = [Math]::Max(1, [int][Math]::Floor($width / 4))
$colors = @('Yellow', 'Magenta', 'Cyan', 'White')

Write-Host "`n🍪 HEMMELIG COOKIE-PORTAL AKTIVERET 🍪" -ForegroundColor Yellow
foreach ($message in @(
    '✨ Fniselise er ankommet til køkkenet...'
    '🔥 Ovnen varmer op. Chokoladen gør sig klar.'
    '🍪 ADVARSEL: URIMELIGT GODE COOKIES PÅ VEJ!'
)) {
    Write-Host $message -ForegroundColor Magenta
    Start-Sleep -Milliseconds ($DelayMs * 5)
}

for ($heat = 0; $heat -le 10; $heat++) {
    $bar = ('#' * $heat) + ('.' * (10 - $heat))
    Write-Host ("`r🔥 Cookie-kraft [{0}] {1,3}%" -f $bar, ($heat * 10)) -NoNewline -ForegroundColor Yellow
    Start-Sleep -Milliseconds ($DelayMs * 2)
}
Write-Host "`n🚀 COOKIE-KRAFT: 9001% — OVNEN HAR FORLADT ATMOSFÆREN!" -ForegroundColor Cyan

# Hver kolonne har sin egen rytme, så cookies falder i bølger som code rain.
$streams = @(for ($column = 0; $column -lt $columns; $column++) {
    [pscustomobject]@{
        Offset = Get-Random -Minimum 0 -Maximum 15
        Period = Get-Random -Minimum 7 -Maximum 16
    }
})
for ($frame = 0; $frame -lt $Frames; $frame++) {
    $row = -join $(foreach ($stream in $streams) {
        $phase = ($frame + $stream.Offset) % $stream.Period
        if ($phase -lt 2) { '🍪  ' }
        elseif ($phase -eq 2) { '✨  ' }
        elseif ($phase -eq 3) { ' ·  ' }
        else { '    ' }
    })
    Write-Host $row -ForegroundColor $colors[$frame % $colors.Count]
    if ($frame -eq [int]($Frames / 3)) {
        Write-Host '🍪 DET REGNER MED FNISELISES COOKIES! 🍪' -ForegroundColor Yellow
    }
    if ($frame -eq [int](2 * $Frames / 3)) {
        Write-Host '✨ SPRØDE KANTER! BLØD MIDTE! MERE CHOKOLADE! ✨' -ForegroundColor Magenta
    }
    Start-Sleep -Milliseconds $DelayMs
}

$cookie = @(
    '          .-~~~~~~~~~-.'
    '       .-~   o    O    ~-.'
    '      /  O      o    o   \'
    '     |     o       O     |'
    '     |  O     o       o  |'
    '      \    o     O      /'
    '       `-.    o     .-`'
    '          ~--------~'
)
foreach ($line in $cookie) {
    Write-Host $line -ForegroundColor Yellow
    Start-Sleep -Milliseconds ($DelayMs * 2)
}
Write-Host "`n👑 FNISELISE — COOKIE-DRONNINGEN 👑" -ForegroundColor Magenta
Write-Host '🍪 Hun laver ikke bare gode cookies. Hun laver LEGENDARISKE cookies! 🍪' -ForegroundColor Yellow
Write-Host "✨ Tak for cookies, Fniselise! ✨`n" -ForegroundColor Cyan
