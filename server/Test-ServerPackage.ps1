#requires -Version 5.1
[CmdletBinding()]
param([Parameter(Mandatory = $true)][string]$PackagePath)
$ErrorActionPreference = 'Stop'
$folder = (Resolve-Path -LiteralPath $PackagePath).Path
foreach ($file in @('OnlyMags.Admin.exe', 'Start-Admin.cmd', 'Scripts/Invoke-AdminJob.ps1', 'Scripts/Import-Employees.ps1', 'Scripts/Revert-Employees.ps1')) {
    if (-not (Test-Path -LiteralPath (Join-Path $folder $file))) { throw "Package missing $file" }
}
$process = Start-Process -FilePath (Join-Path $folder 'OnlyMags.Admin.exe') -WorkingDirectory $folder -WindowStyle Hidden -PassThru
try {
    $response = $null
    for ($i = 0; $i -lt 30; $i++) {
        if ($process.HasExited) { throw 'Package exited during startup (is port 5088 already in use?).' }
        try { $response = Invoke-WebRequest 'http://localhost:5088' -UseBasicParsing; break } catch { Start-Sleep -Milliseconds 200 }
    }
    if ($null -eq $response -or $response.Content -notmatch 'OnlyMAGS' -or $response.Content -notmatch 'blazor') { throw 'Blazor page did not render.' }
    foreach ($match in [regex]::Matches($response.Content, '(?:href|src)="([^"]+\.(?:css|js))"')) {
        $url = 'http://localhost:5088/' + $match.Groups[1].Value.TrimStart('/')
        if ((Invoke-WebRequest $url -UseBasicParsing).StatusCode -ne 200) { throw "Missing static asset: $url" }
    }
    if ((Invoke-WebRequest 'http://localhost:5088/console.js' -UseBasicParsing).StatusCode -ne 200) { throw 'Missing log module' }
    $csv = Invoke-WebRequest 'http://localhost:5088/results.csv' -UseBasicParsing
    if ($csv.Headers['Content-Type'] -notlike 'text/csv*') { throw 'CSV endpoint returned wrong content type' }
    $negotiation = Invoke-WebRequest 'http://localhost:5088/_blazor/negotiate?negotiateVersion=1' -Method Post -UseBasicParsing
    if ($negotiation.Content -notmatch 'connectionToken') { throw 'Interactive Server negotiation failed' }
    $blocked = $false
    try { Invoke-WebRequest 'http://localhost:5088/' -Headers @{ Origin = 'https://untrusted.example' } -UseBasicParsing | Out-Null }
    catch { $blocked = [int]$_.Exception.Response.StatusCode -eq 403 }
    if (-not $blocked) { throw 'Cross-origin request was not blocked' }
    Write-Output 'PASS: standalone package startup, Blazor SSR, static assets, log module, CSV endpoint, SignalR negotiation and origin protection. No AD contacted.'
} finally {
    if (-not $process.HasExited) { Stop-Process -Id $process.Id }
}
