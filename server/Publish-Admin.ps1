#requires -Version 5.1
[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$project = Join-Path $PSScriptRoot 'OnlyMags.Admin/OnlyMags.Admin.csproj'
$output = Join-Path $PSScriptRoot ('artifacts/OnlyMags-Admin-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
Write-Host 'Building the standalone Windows x64 server package...'
& dotnet publish $project -c Release -r win-x64 --self-contained true -o $output
if ($LASTEXITCODE -ne 0) { throw 'Publish failed.' }
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'README.md') -Destination (Join-Path $output 'README.md')
Write-Host "Ready: $output" -ForegroundColor Green
Write-Host 'Copy this entire folder to the server, then run Start-Admin.cmd.'
