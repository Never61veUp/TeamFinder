using System.Text.Json;

namespace TeamFinder.Application.Abstractions;

public interface IGitHubServiceExternal
{
    Task<string> GetAccessToken(string code, string clientId, string clientSecret);
    Task<JsonDocument> GetUser(string accessToken);
    Task<JsonDocument> GetUserRepos(string username);
    Task<JsonDocument> GetUserEvents(string username);
}