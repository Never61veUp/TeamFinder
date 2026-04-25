using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.DataProtection;

namespace TeamFinder.API.Extensions;

public static class DataProtectionExtension
{
    public static IServiceCollection AddProtection(this IServiceCollection services, 
        IConfiguration configuration, IWebHostEnvironment environment)
    {
        var keysFolder = configuration["DP_KEYS_FOLDER"] ?? "/keys";

        try
        {
            var dir = new DirectoryInfo(keysFolder);
            if (!dir.Exists) dir.Create();

            var dpBuilder = services.AddDataProtection()
                .SetApplicationName("TeamFinder")
                .PersistKeysToFileSystem(dir);

            var pfxPath = configuration["DP_PROTECT_PFX_PATH"];
            if (!string.IsNullOrWhiteSpace(pfxPath))
            {
                ConfigureCertificateProtection(dpBuilder, pfxPath, 
                    configuration["DP_PROTECT_PFX_PASSWORD"]);
            }
        }
        catch (Exception ex)
        {
            if (environment.IsProduction()) throw;
            
            Console.WriteLine($"[Warning] DataProtection configuration failed: {ex.Message}");
        }

        return services;
    }

    private static void ConfigureCertificateProtection(IDataProtectionBuilder builder, 
        string pfxPath, string? password)
    {
        try
        {
            var cert = string.IsNullOrEmpty(password)
                ? X509CertificateLoader.LoadCertificateFromFile(pfxPath)
                : X509CertificateLoader.LoadPkcs12FromFile(pfxPath, password, 
                    X509KeyStorageFlags.MachineKeySet);

            builder.ProtectKeysWithCertificate(cert);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Warning] Failed to load DP certificate: {ex.Message}");
        }
    }
}