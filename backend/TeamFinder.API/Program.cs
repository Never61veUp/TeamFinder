using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using TeamFinder.API.Extensions;
using TeamFinder.Postgresql;

var builder = WebApplication.CreateBuilder(args);


builder.Configuration.AddEnvironmentVariables();
    

builder.Services.AddProtection(builder.Configuration, builder.Environment);
builder.Services.AddAppAuthentication(builder.Configuration);
builder.Services.AddAuthorization();
builder.Services.AddCustomCors();


builder.Services.AddTelegramOptions(builder.Configuration);


builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApplicationServices();


builder.Services.AddControllers();
builder.Services.AddOpenApi();


builder.Services.AddGitHubClient();


var app = builder.Build();


if (Environment.GetEnvironmentVariable("RUN_MIGRATIONS") == "true")
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.MapOpenApi();
app.MapScalarApiReference(options =>
{
    options.Title = "API Documentation";
    options.Theme = ScalarTheme.Default;
    options.AddServer("https://api.teamfinder.mixdev.me/");
    options.Layout = ScalarLayout.Classic;
});


app.UseHttpsRedirection();
app.UseCors(app.Environment.IsDevelopment() ? "cors-dev" : "cors-prod");


app.MapControllers();
app.MapGet("/healthz", () => Results.Ok(new { status = "ok" }));

app.Run();