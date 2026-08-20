using Api;

var builder = WebApplication.CreateBuilder(args);

// ALLOWED_ORIGINS is a comma-separated list (e.g. the deployed Vercel URL in
// production); local dev origins are always allowed on top of it.
var extraOrigins = (Environment.GetEnvironmentVariable("ALLOWED_ORIGINS") ?? "")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
var allowedOrigins = new[] { "http://localhost:5173", "http://127.0.0.1:5173" }.Concat(extraOrigins).ToArray();

builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()));

var app = builder.Build();
app.UseCors();

InvoiceStore.Initialize();
SettingsStore.Initialize();

app.MapGet("/api/invoices", async () =>
{
    using var db = InvoiceStore.OpenConnection();
    return await InvoiceStore.GetAllAsync(db);
});

app.MapGet("/api/invoices/{id}", async (string id) =>
{
    using var db = InvoiceStore.OpenConnection();
    var invoice = await InvoiceStore.GetByIdAsync(db, id);
    return invoice is not null ? Results.Ok(invoice) : Results.NotFound(new { message = $"Invoice {id} not found" });
});

app.MapPost("/api/invoices", async (InvoiceInput input) =>
{
    using var db = InvoiceStore.OpenConnection();
    var created = await InvoiceStore.CreateAsync(db, input);
    return Results.Created($"/api/invoices/{created.Id}", created);
});

app.MapPut("/api/invoices/{id}", async (string id, InvoiceInput input) =>
{
    using var db = InvoiceStore.OpenConnection();
    var updated = await InvoiceStore.UpdateAsync(db, id, input);
    return updated is not null ? Results.Ok(updated) : Results.NotFound(new { message = $"Invoice {id} not found" });
});

app.MapGet("/api/settings", async () =>
{
    using var db = InvoiceStore.OpenConnection();
    return await SettingsStore.GetAsync(db);
});

app.MapPut("/api/settings", async (Settings input) =>
{
    using var db = InvoiceStore.OpenConnection();
    return await SettingsStore.UpdateAsync(db, input);
});

app.Run();
