# Tilfældige svar og et særligt Frederik-svar - kun for sjov.
[CmdletBinding()]
param(
    [string]$Question,
    [ValidateRange(0, 2000)][int]$DelayMs = 1500
)
if ([string]::IsNullOrWhiteSpace($Question)) {
    $Question = Read-Host 'Stil spåkuglen et ja/nej-spørgsmål'
}
if ([string]::IsNullOrWhiteSpace($Question)) {
    Write-Host 'Selv en spåkugle har brug for et spørgsmål.' -ForegroundColor Yellow
    return
}
$answers = @(
    'Ja. Krystalkuglen lyser grønt, og selv skæbnen har givet en tommel op.'
    'Ja! Jeg har set fremtiden. Du så meget tilfreds ud.'
    'Helt klart ja. Stjernerne står på række som folk ved gratis kage.'
    'Ja. For en gangs skyld er både mavefornemmelsen og universet enige.'
    'Ja! Det står skrevet i stjernerne. Lige ved siden af husk at købe mælk.'
    'Ja. Selv min mest pessimistiske tarotbunke klappede.'
    'Nej. Jeg trak tre kort. Alle tre sagde glem det.'
    'Absolut nej. Selv din skytsengel har slået notifikationerne fra.'
    'Nej. Krystalkuglen forsøgte faktisk at rulle væk fra spørgsmålet.'
    'Nej. Det bliver en af de historier, der begynder med det virkede ellers smart.'
    'Niks. Jeg spurgte ånderne igen, og nu er de irriterede.'
    'Nej. Universet har lukket den dør og stillet en sofa foran.'
    'Måske. Jeg ser to fremtider. I den ene virker det. I den anden bestiller du pizza.'
    'Det hælder mod ja. Men nogen skal lige tage sig sammen først.'
    'Det hælder mod nej. Du har dog før overlevet på ren stædighed.'
    'Ja, hvis du gør noget ved det. Skæbnen gider ikke lave gruppearbejdet alene.'
    'Ikke endnu. Selv mirakler skal lige have deres morgenkaffe.'
    'Halvt ja, halvt nej. Min krystalkugle kalder det fleksibilitet.'
    'Måske. Tegnene er lovende, men Merkur står åbenbart i kø i Netto.'
    'Svaret er tåget. Enten venter der stor succes, eller også har jeg glemt at pudse kuglen.'
    'Ja til idéen. Nej til at gøre det fem minutter før deadline.'
)
Write-Host "`nSpørgsmål: $Question" -ForegroundColor Cyan
foreach ($step in @('Seersken pudser krystalkuglen...', 'Vender et kort og hæver et øjenbryn...', 'Stjernerne hvisker deres svar...')) {
    Write-Host $step -ForegroundColor DarkCyan
    Start-Sleep -Milliseconds $DelayMs
}
$answer = if ($Question -match 'programmør') {
    'Ja alle burde skifte til den rigtige linje, hvor man bliver programmør, det ville være en fantastisk beslutning!'
} elseif ($Question -match 'frederik') {
    'Næææ, han burde nok stadig have været på arbejde eller hjemme i Aulumn. Men god tur til Frankrig i morgen, Frederik! Nyd det, og spis en croissant for os andre!'
} else {
    Get-Random -InputObject $answers
}
Write-Host ("`nSeersken siger: {0}" -f $answer) -ForegroundColor Magenta
