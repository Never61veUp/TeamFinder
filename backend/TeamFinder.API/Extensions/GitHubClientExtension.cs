using System.Net.Http.Headers;
using TeamFinder.Application.Abstractions;
using TeamFinder.Application.Services;

namespace TeamFinder.API.Extensions;

public static class GitHubClientExtension
{
    public static IServiceCollection AddGitHubClient(this IServiceCollection services)
    {
        services.AddHttpClient<IGitHubServiceExternal, GitHubServiceExternal>(client =>
        {
            client.DefaultRequestHeaders.UserAgent.Add(
                new ProductInfoHeaderValue("MyApp", "1.0"));
            client.BaseAddress = new Uri("https://api.github.com/");
        });
        
        return services;
    }
}