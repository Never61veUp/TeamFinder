using System.Net.Http.Headers;
using Microsoft.AspNetCore.HttpOverrides;
using Scalar.AspNetCore;
using TeamFinder.API.Security;
using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.DataProtection;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using TeamFinder.Application.Services;
using TeamFinder.Postgresql;
using TeamFinder.Postgresql.Repositories;

var builder = WebApplication.CreateBuilder(args);


builder.Configuration.AddEnvironmentVariables();
builder.Logging.AddConsole();

{
    var keysFolder = builder.Configuration["DP_KEYS_FOLDER"] ?? "/keys";
    try
    {
        // Ensure directory exists
        var dir = new System.IO.DirectoryInfo(keysFolder);
        if (!dir.Exists) dir.Create();

        var dpBuilder = builder.Services.AddDataProtection()
            .SetApplicationName("TeamFinder")
            .PersistKeysToFileSystem(dir);

        // Optionally protect keys with a PFX certificate (path inside container or mounted secret)
        var pfxPath = builder.Configuration["DP_PROTECT_PFX_PATH"];
        if (!string.IsNullOrWhiteSpace(pfxPath))
        {
            try
            {
                var pfxPassword = builder.Configuration["DP_PROTECT_PFX_PASSWORD"];
                var cert = string.IsNullOrEmpty(pfxPassword)
                    ? X509CertificateLoader.LoadCertificateFromFile(pfxPath)
                    : X509CertificateLoader.LoadPkcs12FromFile(pfxPath, pfxPassword, X509KeyStorageFlags.MachineKeySet);

                dpBuilder.ProtectKeysWithCertificate(cert);
            }
            catch (Exception ex)
            {
                // If certificate loading fails, continue but warn (do not throw to avoid killing startup)
                Console.WriteLine($"Warning: failed to load DP protection certificate: {ex.Message}");
            }
        }
    }
    catch (Exception ex)
    {
        // If persisting keys fails, leave default behavior but log warning
        Console.WriteLine($"Warning: failed to configure DataProtection key persistence: {ex.Message}");
        if (builder.Environment.IsProduction())
            throw;
    }
}

// Add services to the container.

var connectionString = builder.Configuration.GetConnectionString("Postgres");

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddCors(options =>
{
    options.AddPolicy("cors-dev", policy =>
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod());

    options.AddPolicy("cors-prod", policy =>
        policy
            .WithOrigins("http://localhost:8080", "https://teamfinder.mixdev.me")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services
    .AddAuthentication(Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var issuer = builder.Configuration["JWT_ISSUER"] ?? "MiniApp";
        var audience = builder.Configuration["JWT_AUDIENCE"] ?? "MiniApp";
        var key = builder.Configuration["JWT_KEY"];
        if (string.IsNullOrWhiteSpace(key))
            throw new InvalidOperationException("Missing JWT signing key. Set environment variable JWT_KEY.");

        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
                System.Text.Encoding.UTF8.GetBytes(key)),
            RoleClaimType = ClaimTypes.Role,
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddSingleton<TelegramWebAppValidator>();
builder.Services.AddSingleton<JwtTokenService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<ISkillService, SkillService>();
builder.Services.AddScoped<IGithubService, GithubService>();
builder.Services.AddHttpClient<IGitHubServiceExternal, GitHubServiceExternal>(client =>
{
    client.DefaultRequestHeaders.UserAgent.Add(
        new ProductInfoHeaderValue("MyApp", "1.0"));
    client.BaseAddress = new Uri("https://api.github.com/");
});

builder.Services.AddScoped<IProfileRepository, ProfileRepository>();
builder.Services.AddScoped<ISkillRepository, SkillRepository>();

var app = builder.Build();
// Configure the HTTP request pipeline.

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

if (app.Environment.IsDevelopment())
{
    
}
app.UseCors(app.Environment.IsDevelopment() ? "cors-dev" : "cors-prod");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGet("/", () => Results.Ok("OK"));
app.MapGet("/healthz", () => Results.Ok(new { status = "ok" }));
app.Run();