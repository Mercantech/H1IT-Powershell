# Tre raketter med tilfældig fart. Hep på din favorit!
[CmdletBinding()]
param(
    [ValidateRange(5, 100)][int]$Distance = 30,
    [ValidateRange(0, 2000)][int]$DelayMs = 200,
    [ValidateSet('Kaffe', 'Monster', 'Booster')][string]$Bet
)
$racers = @(
    [pscustomobject]@{ Name = 'Kaffe'; Position = 0; Color = 'Yellow' }
    [pscustomobject]@{ Name = 'Monster'; Position = 0; Color = 'Cyan' }
    [pscustomobject]@{ Name = 'Booster'; Position = 0; Color = 'Magenta' }
)
Write-Host "`nRAKETKAPLØB - hep på Kaffe, Monster eller Booster!" -ForegroundColor Cyan
if (-not $Bet) {
    Write-Host 'Placér dit bet: 1. Kaffe   2. Monster   3. Booster' -ForegroundColor Yellow
    do {
        $selection = (Read-Host 'Hvem vinder? Skriv nummer eller navn').Trim()
        $selectedBet = switch ($selection) {
            '1' { 'Kaffe' }
            '2' { 'Monster' }
            '3' { 'Booster' }
            'Kaffe' { 'Kaffe' }
            'Monster' { 'Monster' }
            'Booster' { 'Booster' }
        }
        if (-not $selectedBet) {
            Write-Host 'Vælg 1, 2, 3, Kaffe, Monster eller Booster.' -ForegroundColor Yellow
        }
    } while (-not $selectedBet)
    $Bet = $selectedBet
}
Write-Host ("Dit bet er på {0}. Nu gælder det håneretten!" -f $Bet) -ForegroundColor Yellow
$round = 0
do {
    $round++
    Write-Host "`n--- Runde $round ---"
    foreach ($racer in $racers) {
        $racer.Position = [Math]::Min($Distance, $racer.Position + (Get-Random -Minimum 1 -Maximum 5))
        $track = ('.' * $racer.Position) + '==>' + (' ' * ($Distance - $racer.Position)) + '|'
        Write-Host ('{0,-7} {1}' -f $racer.Name, $track) -ForegroundColor $racer.Color
    }
    $winners = @($racers | Where-Object { $_.Position -ge $Distance })
    Start-Sleep -Milliseconds $DelayMs
} while ($winners.Count -eq 0)
if ($winners.Count -gt 1) {
    Write-Host ("DØDT LØB! {0} deler sejren!" -f ($winners.Name -join ' og ')) -ForegroundColor Green
} else {
    Write-Host ("{0} vinder! Præmien er en ekstra kaffepause." -f $winners[0].Name) -ForegroundColor Green
}
if ($winners.Name -contains $Bet) {
    Write-Host ("DU VANDT DIT BET! {0} kom først over stregen. Håneretten er din!" -f $Bet) -ForegroundColor Yellow
} else {
    Write-Host ("Øv! Du satsede på {0}, men {1} tog sejren. Prøv igen!" -f $Bet, ($winners.Name -join ' og ')) -ForegroundColor Magenta
}
