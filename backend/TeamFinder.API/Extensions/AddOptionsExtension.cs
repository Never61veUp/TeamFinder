using TeamFinder.API.Options;

namespace TeamFinder.API.Extensions;

public static class AddOptionsExtension
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddTelegramOptions(IConfiguration configuration)
        {
            services.AddOptions<TelegramOptions>()
                .Bind(configuration.GetSection(TelegramOptions.SectionName))
                .ValidateDataAnnotations()
                .ValidateOnStart();
        
            return services;
        }

        public IServiceCollection AddGitHubOptions(IConfiguration configuration)
        {
            services.AddOptions<GitHubOptions>()
                .Bind(configuration.GetSection(GitHubOptions.SectionName))
                .ValidateDataAnnotations()
                .ValidateOnStart();
        
            return services;
        }
    }
}