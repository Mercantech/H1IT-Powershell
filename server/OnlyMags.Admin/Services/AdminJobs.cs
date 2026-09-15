using System.Diagnostics;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.VisualBasic.FileIO;

namespace OnlyMags.Admin.Services;

public record Batch(byte[] Bytes, string Name, string Delimiter, int Count, string[] Accounts)
{
    public static Batch Parse(byte[] bytes, string name, string delimiter)
    {
        if (bytes.Length is 0 or > 5_000_000 || delimiter is not (";" or ","))
            throw new InvalidOperationException("Vælg en CSV på højst 5 MB og den rigtige separator.");
        using var reader = new TextFieldParser(new MemoryStream(bytes), new UTF8Encoding(false, true), true);
        reader.SetDelimiters(delimiter);
        reader.HasFieldsEnclosedInQuotes = true;
        var headers = reader.ReadFields() ?? [];
        foreach (var column in new[] { "SamAccountName", "UserPrincipalName", "TargetDomain", "EmployeeID", "TargetOU" })
            if (!headers.Contains(column)) throw new InvalidOperationException($"CSV mangler {column}. Kontrollér separatoren.");
        var accountIndex = Array.IndexOf(headers, "SamAccountName");
        var accounts = new List<string>();
        while (!reader.EndOfData)
        {
            var fields = reader.ReadFields()!;
            if (fields.Length != headers.Length) throw new InvalidOperationException("En CSV-række har forkert antal felter.");
            accounts.Add(fields[accountIndex]);
            if (accounts.Count > 1000) throw new InvalidOperationException("Maksimalt 1.000 medarbejdere pr. kørsel.");
        }
        if (accounts.Count == 0) throw new InvalidOperationException("CSV-filen indeholder ingen medarbejdere.");
        return new(bytes, Path.GetFileName(name), delimiter, accounts.Count, accounts.Take(8).ToArray());
    }
}

public record JobSnapshot(bool Running, bool Success, bool Preview, string Operation, string FileName,
    string Server, int Total, TimeSpan Elapsed, string[] Logs, Dictionary<string, string>[] Results, string? Error);

// Single local administrator, one job at a time; survives browser disconnects.
public sealed class AdminJobs
{
    private readonly object gate = new();
    private readonly List<string> logs = [];
    private readonly List<Dictionary<string, string>> results = [];
    private bool running, success, preview;
    private string operation = "Import", fileName = "", server = "";
    private int total;
    private string? error, approvedFingerprint;
    private readonly Stopwatch clock = new();
    public JobSnapshot Snapshot()
    {
        lock (gate) return new(running, success, preview, operation, fileName, server, total, clock.Elapsed,
            logs.ToArray(), results.Select(r => new Dictionary<string, string>(r)).ToArray(), error);
    }
    private static string Fingerprint(Batch batch, string server, string operation) =>
        Convert.ToHexString(SHA256.HashData(batch.Bytes)) + ":" + server + ":" + operation + ":" + batch.Delimiter;
    public bool CanExecute(Batch batch, string server, string operation)
    {
        lock (gate) return !running && approvedFingerprint == Fingerprint(batch, server.Trim(), operation);
    }
    public void Start(Batch batch, string targetServer, string action, bool dryRun, string password = "")
    {
        targetServer = targetServer.Trim();
        if (action is not ("Import" or "Revert") || !Regex.IsMatch(targetServer, @"\A[a-zA-Z0-9][a-zA-Z0-9.-]{0,252}\z"))
            throw new InvalidOperationException("Angiv domænecontrollerens DNS-navn, fx dc01.mags.local.");
        // Validate again at the execution boundary, not just in the component.
        batch = Batch.Parse(batch.Bytes.ToArray(), batch.Name, batch.Delimiter);
        lock (gate)
        {
            if (running) throw new InvalidOperationException("En kørsel er allerede i gang.");
            if (!dryRun && approvedFingerprint != Fingerprint(batch, targetServer, action))
                throw new InvalidOperationException("Kør en vellykket prøvekørsel med samme fil, handling og server først.");
            if (!dryRun && action == "Import" && string.IsNullOrEmpty(password))
                throw new InvalidOperationException("Angiv en midlertidig adgangskode.");
            approvedFingerprint = null;
            running = true; success = false; preview = dryRun; operation = action;
            fileName = batch.Name; server = targetServer; total = batch.Count; error = null;
            logs.Clear(); results.Clear(); clock.Restart();
            _ = Task.Run(() => RunAsync(batch, targetServer, action, dryRun, password));
        }
    }
    private void Log(string line)
    {
        lock (gate) { logs.Add(line); if (logs.Count > 2000) logs.RemoveAt(0); }
    }
    private async Task RunAsync(Batch batch, string targetServer, string action, bool dryRun, string password)
    {
        var directory = Path.Combine(Path.GetTempPath(), "OnlyMags-" + Guid.NewGuid().ToString("N"));
        var path = Path.Combine(directory, "employees.csv");
        string Redact(string text) => string.IsNullOrEmpty(password) ? text : text.Replace(password, "[redacted]", StringComparison.Ordinal);
        try
        {
            Directory.CreateDirectory(directory);
            await File.WriteAllBytesAsync(path, batch.Bytes);
            var start = new ProcessStartInfo
            {
                FileName = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Windows), @"System32\WindowsPowerShell\v1.0\powershell.exe"),
                UseShellExecute = false, CreateNoWindow = true, RedirectStandardInput = true,
                RedirectStandardOutput = true, RedirectStandardError = true,
                StandardInputEncoding = new UTF8Encoding(false), StandardOutputEncoding = Encoding.UTF8,
                StandardErrorEncoding = Encoding.UTF8
            };
            // dotnet launched from PS7 otherwise inherits incompatible built-in modules.
            var modulePaths = (start.Environment.TryGetValue("PSModulePath", out var inheritedModules) ? inheritedModules ?? "" : "").Split(';', StringSplitOptions.RemoveEmptyEntries)
                .Where(p => !p.Contains(@"\PowerShell\", StringComparison.OrdinalIgnoreCase) &&
                            !p.Contains(@"\microsoft.powershell_", StringComparison.OrdinalIgnoreCase));
            start.Environment["PSModulePath"] = string.Join(';', modulePaths);
            foreach (var argument in new[] { "-NoLogo", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "RemoteSigned", "-File", Path.Combine(AppContext.BaseDirectory, "Scripts", "Invoke-AdminJob.ps1") })
                start.ArgumentList.Add(argument);
            using var process = Process.Start(start) ?? throw new InvalidOperationException("PowerShell kunne ikke startes.");
            Log($"{DateTime.Now:HH:mm:ss} · Starter {(dryRun ? "prøvekørsel" : action)} mod {targetServer}");
            await process.StandardInput.WriteLineAsync(JsonSerializer.Serialize(new { csvPath = path, server = targetServer, operation = action, preview = dryRun, delimiter = batch.Delimiter, password }));
            process.StandardInput.Close();
            var stderr = Task.Run(async () =>
            {
                while (await process.StandardError.ReadLineAsync() is { } line) Log(Redact(line));
            });
            var completed = false;
            while (await process.StandardOutput.ReadLineAsync() is { } line)
            {
                try
                {
                    using var json = JsonDocument.Parse(line);
                    var kind = json.RootElement.GetProperty("kind").GetString();
                    var data = json.RootElement.GetProperty("data");
                    if (kind == "result")
                    {
                        var row = data.EnumerateObject().ToDictionary(p => p.Name, p => Redact(p.Value.ToString()));
                        lock (gate) results.Add(row);
                    }
                    else if (kind == "complete") completed = data.GetBoolean();
                    else
                    {
                        Log(Redact(data.ToString()));
                        if (kind == "error") { lock (gate) error = Redact(data.ToString()); }
                    }
                }
                catch (JsonException) { Log(Redact(line)); } // WhatIf also writes plain host output.
            }
            await process.WaitForExitAsync();
            await stderr;
            lock (gate)
            {
                success = completed && process.ExitCode == 0 && results.Count == total && error is null;
                if (!success) error ??= $"PowerShell sluttede uden et komplet resultat (exit {process.ExitCode}). Se loggen.";
                if (success && dryRun) approvedFingerprint = Fingerprint(batch, targetServer, action);
            }
        }
        catch (Exception ex) { lock (gate) error = Redact(ex.Message); }
        finally
        {
            try { if (File.Exists(path)) File.Delete(path); if (Directory.Exists(directory)) Directory.Delete(directory); }
            catch (Exception ex) { Log("Midlertidig CSV kunne ikke ryddes: " + Redact(ex.Message)); }
            lock (gate) { clock.Stop(); running = false; }
        }
    }
    public byte[] ExportCsv()
    {
        var snapshot = Snapshot();
        string Cell(string value)
        {
            if (value.TrimStart().StartsWith('=') || value.TrimStart().StartsWith('+') || value.TrimStart().StartsWith('-') || value.TrimStart().StartsWith('@')) value = "'" + value;
            return "\"" + value.Replace("\"", "\"\"") + "\"";
        }
        var columns = new[] { "SamAccountName", "UserPrincipalName", "Status", "Details", "TargetOU", "Groups", "ExpectedGPOs", "Permissions", "ObjectGUID" };
        var text = string.Join(';', columns.Select(Cell)) + "\r\n" + string.Join("\r\n", snapshot.Results.Select(row => string.Join(';', columns.Select(c => Cell(row.GetValueOrDefault(c, ""))))));
        return Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(text)).ToArray();
    }
}
