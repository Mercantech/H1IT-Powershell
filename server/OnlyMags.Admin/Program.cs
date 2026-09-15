using OnlyMags.Admin.Components;
using OnlyMags.Admin.Services;
using System.Net;

var builder = WebApplication.CreateBuilder(args);
// This local administration app deliberately has no remote access mode.
builder.WebHost.ConfigureKestrel(options => options.ListenLocalhost(5088));
builder.Services.AddSingleton<AdminJobs>();

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

var app = builder.Build();
app.Use(async (context, next) =>
{
    var host = context.Request.Host;
    var origin = context.Request.Headers.Origin.ToString();
    var validOrigin = string.IsNullOrEmpty(origin) ||
        (Uri.TryCreate(origin, UriKind.Absolute, out var uri) && uri.Authority == host.Value && uri.Scheme == context.Request.Scheme);
    if (context.Connection.RemoteIpAddress is not { } ip || !IPAddress.IsLoopback(ip) ||
        host.Host is not ("localhost" or "127.0.0.1" or "[::1]") || !validOrigin ||
        context.Request.Headers["Sec-Fetch-Site"] == "cross-site")
    {
        context.Response.StatusCode = 403;
        return;
    }
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    await next();
});

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
}
app.UseStatusCodePagesWithReExecute("/not-found", createScopeForStatusCodePages: true);
app.UseAntiforgery();

app.MapStaticAssets();
app.MapGet("/results.csv", (AdminJobs jobs) => Results.File(jobs.ExportCsv(), "text/csv; charset=utf-8", "onlymags-results.csv"));
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

app.Run();
