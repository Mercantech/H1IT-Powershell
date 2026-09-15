#requires -Version 5.1
# Private bridge: one JSON request on stdin, JSON Lines events on stdout.
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
[Console]::InputEncoding = [Text.UTF8Encoding]::new($false)
function Send-Event([string]$Kind, $Data) {
    [Console]::WriteLine((@{ kind = $Kind; data = $Data } | ConvertTo-Json -Depth 8 -Compress))
}
$secret = $null
try {
    $request = [Console]::In.ReadLine() | ConvertFrom-Json
    if ($request.operation -notin @('Import', 'Revert')) { throw 'Unknown operation.' }
    $script = Join-Path $PSScriptRoot ($request.operation + '-Employees.ps1')
    $parameters = @{ CsvPath = [string]$request.csvPath; Server = [string]$request.server;
        Delimiter = [string]$request.delimiter; Confirm = $false; WhatIf = [bool]$request.preview }
    if ($request.operation -eq 'Import' -and -not $request.preview) {
        if ([string]::IsNullOrEmpty($request.password)) { throw 'A temporary password is required.' }
        $secret = ConvertTo-SecureString $request.password -AsPlainText -Force
        $parameters.InitialPassword = $secret
    }
    $request.password = $null
    & $script @parameters 6>&1 3>&1 4>&1 5>&1 | ForEach-Object {
        if ($_ -is [System.Management.Automation.InformationRecord]) { Send-Event 'log' $_.MessageData.ToString() }
        elseif ($null -ne $_.PSObject.Properties['Status']) { Send-Event 'result' $_ }
        else { Send-Event 'log' $_.ToString() }
    }
    Send-Event 'complete' $true
    exit 0
} catch {
    Send-Event 'error' $_.Exception.Message
    exit 1
} finally {
    if ($null -ne $secret) { $secret.Dispose() }
}
