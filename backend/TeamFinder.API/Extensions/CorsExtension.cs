namespace TeamFinder.API.Extensions;

public static class CorsExtension
{
    public static IServiceCollection AddCustomCors(this IServiceCollection services)
    {
        services.AddCors(options =>
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
        
        return services;
    }
}