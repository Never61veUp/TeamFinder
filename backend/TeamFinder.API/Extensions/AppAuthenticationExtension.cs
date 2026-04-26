using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

namespace TeamFinder.API.Extensions;

public static class AppAuthenticationExtension
{
    public static IServiceCollection AddAppAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                var issuer = configuration["JWT_ISSUER"] ?? "MiniApp";
                var audience = configuration["JWT_AUDIENCE"] ?? "MiniApp";
                var key = configuration["JWT_KEY"];
                if (string.IsNullOrWhiteSpace(key))
                    throw new InvalidOperationException("Missing JWT signing key. Set environment variable JWT_KEY.");

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateIssuerSigningKey = true,
                    ValidateLifetime = true,
                    ValidIssuer = issuer,
                    ValidAudience = audience,
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(key)),
                    RoleClaimType = ClaimTypes.Role
                };
            });
        
        return services;
    }
}