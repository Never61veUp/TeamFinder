using System.Net.Http.Headers;
using System.Text.Json;

namespace TeamFinder.Application.Services;

public interface IGitHubServiceExternal
{
    Task<string> GetAccessToken(string code, string clientId, string clientSecret);
    Task<JsonDocument> GetUser(string accessToken);
    Task<JsonDocument> GetUserRepos(string username);
    Task<JsonDocument> GetUserEvents(string username);
}

public class GitHubServiceExternal : IGitHubServiceExternal
{
    private readonly HttpClient _http;

    public GitHubServiceExternal(HttpClient http)
    {
        _http = http;
    }

    public async Task<string> GetAccessToken(string code, string clientId, string clientSecret)
    {
        var values = new Dictionary<string, string>
        {
            { "client_id", clientId },
            { "client_secret", clientSecret },
            { "code", code }
        };

        var content = new FormUrlEncodedContent(values);
        var response = await _http.PostAsync("https://github.com/login/oauth/access_token", content);

        var result = await response.Content.ReadAsStringAsync();
        var parsed = System.Web.HttpUtility.ParseQueryString(result);

        return parsed["access_token"];
    }

    public async Task<JsonDocument> GetUser(string accessToken)
    {
        _http.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await _http.GetAsync("https://api.github.com/user");
        var json = await response.Content.ReadAsStringAsync();

        return JsonDocument.Parse(json);
    }

    public async Task<JsonDocument> GetUserRepos(string username)
    {
        var response = await _http.GetAsync($"https://api.github.com/users/{username}/repos");
        var json = await response.Content.ReadAsStringAsync();

        return JsonDocument.Parse(json);
    }

    public async Task<JsonDocument> GetUserEvents(string username)
    {
        var response = await _http.GetAsync($"https://api.github.com/users/{username}/events");
        var json = await response.Content.ReadAsStringAsync();

        return JsonDocument.Parse(json);
    }
}