using OnlyMags.Admin.Services;
using System.Text;

static void Assert(bool condition, string message) { if (!condition) throw new Exception(message); }
static void Reject(Action action, string message)
{
    try { action(); } catch (InvalidOperationException) { return; }
    throw new Exception(message);
}
static async Task<JobSnapshot> Finish(AdminJobs jobs)
{
    var deadline = DateTime.UtcNow.AddSeconds(30);
    while (jobs.Snapshot().Running && DateTime.UtcNow < deadline) await Task.Delay(50);
    var state = jobs.Snapshot();
    Assert(!state.Running, "Job timed out");
    return state;
}
const string csv = "EmployeeID;GivenName;Surname;DisplayName;TargetCompany;TargetDomain;SamAccountName;UserPrincipalName;Department;Title;TargetOU;Groups;Permissions;ExpectedGPOs\r\n" +
    "MIG1;Test;One;Test One;Lab;lab.local;test.one;test.one@lab.local;IT;Support;OU=Users,DC=lab,DC=local;GG_Test;Read;Baseline\r\n" +
    "MIG2;Test;Two;Test Two;Lab;lab.local;test.two;test.two@lab.local;IT;Support;OU=Users,DC=lab,DC=local;GG_Test;Read;Baseline\r\n";
var batch = Batch.Parse(Encoding.UTF8.GetBytes(csv), "test.csv", ";");
Assert(batch.Count == 2, "CSV count");
Reject(() => Batch.Parse(batch.Bytes, "test.csv", ","), "Wrong separator must fail");
Reject(() => Batch.Parse(Encoding.UTF8.GetBytes("broken"), "test.csv", ";"), "Invalid headers must fail");
var originalPath = Environment.GetEnvironmentVariable("PSModulePath");
var store = Path.Combine(Path.GetTempPath(), "OnlyMags-test-" + Guid.NewGuid().ToString("N") + ".json");
Environment.SetEnvironmentVariable("PSModulePath", Path.Combine(AppContext.BaseDirectory, "Fixtures") + ";" + originalPath);
Environment.SetEnvironmentVariable("ONLYMAGS_TEST_STORE", store);
try
{
    var jobs = new AdminJobs();
    Reject(() => jobs.Start(batch, "dc.lab.local", "Import", false, "fake-password"), "Execution must require preview");
    Reject(() => jobs.Start(batch, "dc;whoami", "Import", true), "Server injection rejected");
    jobs.Start(batch, "dc.lab.local", "Import", true);
    Reject(() => jobs.Start(batch, "dc.lab.local", "Import", true), "Concurrent jobs rejected");
    var state = await Finish(jobs);
    Assert(state.Success && state.Results.All(r => r["Status"] == "WhatIf"), "Preview failed: " + state.Error + string.Join('\n', state.Logs));
    Assert(!File.Exists(store), "Preview mutated AD");
    Assert(!jobs.CanExecute(batch, "other.lab.local", "Import"), "Server change must invalidate preview");
    Assert(!jobs.CanExecute(batch, "dc.lab.local", "Revert"), "Operation change must invalidate preview");
    var changed = Batch.Parse(Encoding.UTF8.GetBytes(csv.Replace("MIG1", "NEW1")), "test.csv", ";");
    Assert(!jobs.CanExecute(changed, "dc.lab.local", "Import"), "File change must invalidate preview");
    jobs.Start(batch, "dc.lab.local", "Import", false, "fake-password-only-$`'\"-123");
    state = await Finish(jobs);
    Assert(state.Success && state.Results.Count(r => r["Status"] == "Created") == 2, "Import failed: " + state.Error);
    Assert(state.Logs.Any(l => l.Contains("BENCHMARK")), "PowerShell report must reach UI");
    Assert(state.Logs.All(l => !l.Contains("fake-password")), "Password leaked to log");
    Assert(!jobs.CanExecute(batch, "dc.lab.local", "Import"), "Approval must be consumed");
    Assert(Encoding.UTF8.GetString(jobs.ExportCsv()).Contains("Created"), "Results export");
    jobs.Start(batch, "dc.lab.local", "Revert", true);
    state = await Finish(jobs);
    Assert(state.Success && state.Results.All(r => r["Status"] == "WhatIf"), "Revert preview failed: " + state.Error);
    jobs.Start(batch, "dc.lab.local", "Revert", false);
    state = await Finish(jobs);
    Assert(state.Success && state.Results.All(r => r["Status"] == "Deleted"), "Revert failed: " + state.Error);
    jobs.Start(batch, "dc.lab.local", "Revert", true);
    state = await Finish(jobs);
    Assert(state.Success && state.Results.All(r => r["Status"] == "Missing"), "Rerun must show missing users");
    jobs.Start(batch, "fail.lab.local", "Import", true);
    Assert((await Finish(jobs)).Success, "Failure-test preview");
    jobs.Start(batch, "fail.lab.local", "Import", false, "fake-password");
    state = await Finish(jobs);
    Assert(!state.Success && state.Results.All(r => r["Status"] == "Failed") && state.Error is not null, "Partial failures must not be reported as success");
    Console.WriteLine("PASS: CSV, preview guards, concurrent jobs, PS5 bridge, secure parameters, import/revert, reports, export and partial failure. No real AD contacted.");
}
finally
{
    Environment.SetEnvironmentVariable("PSModulePath", originalPath);
    Environment.SetEnvironmentVariable("ONLYMAGS_TEST_STORE", null);
    if (File.Exists(store)) File.Delete(store);
}
