using System.Text.Json;
using CSharpFunctionalExtensions;
using TeamFinder.Core.Model;

namespace TeamFinder.Application.Services;

public interface IGithubService
{
    Task<Result<GithubInfo>> CreateGithubInfo(string githubId, string username, string accessToken);
}

public class GithubService : IGithubService
{
    private readonly IGitHubServiceExternal _gitHubServiceExternal;

    public GithubService(IGitHubServiceExternal gitHubServiceExternal)
    {
        _gitHubServiceExternal = gitHubServiceExternal;
    }

    public async Task<Result<GithubInfo>> CreateGithubInfo(string githubId, string username, string accessToken)
    {
        var repos = await _gitHubServiceExternal.GetUserRepos(username);
        var eventsData = await _gitHubServiceExternal.GetUserEvents(username);

        var repoArray = repos.RootElement;
        var eventsArray = eventsData.RootElement;

        var repoStats = CalculateRepoStats(repoArray);
        var eventStats = CalculateEventStats(eventsArray);

        var topLanguage = GetTopLanguage(repoStats.Languages);
        var activityScore = CalculateActivityScore(repoStats, eventStats);

        var githubInfo = GithubInfo.Create(
            username,
            $"https://github.com/{username}",
            topLanguage,
            repoStats.TotalStars,
            repoStats.RepoCount,
            githubId
        );
        if(githubInfo.IsFailure)
            return Result.Failure<GithubInfo>(githubInfo.Error);
        
        return Result.Success(githubInfo.Value);
    }

    private RepoStats CalculateRepoStats(JsonElement repoArray)
    {
        var totalStars = 0;
        var totalForks = 0;

        var languages = new Dictionary<string, int>();

        foreach (var repo in repoArray.EnumerateArray())
        {
            if (repo.TryGetProperty("stargazers_count", out var stars))
                totalStars += stars.GetInt32();

            if (repo.TryGetProperty("forks_count", out var forks))
                totalForks += forks.GetInt32();

            if (repo.TryGetProperty("language", out var lang) &&
                lang.ValueKind == JsonValueKind.String)
            {
                var langName = lang.GetString();

                if (!string.IsNullOrEmpty(langName))
                    languages[langName] = languages.GetValueOrDefault(langName) + 1;
            }
        }

        return new RepoStats
        {
            RepoCount = repoArray.GetArrayLength(),
            TotalStars = totalStars,
            TotalForks = totalForks,
            Languages = languages
        };
    }

    private string GetTopLanguage(Dictionary<string, int> languages)
    {
        return languages
            .OrderByDescending(x => x.Value)
            .FirstOrDefault().Key ?? "Unknown";
    }

    private int CalculateActivityScore(RepoStats repo, EventStats events)
    {
        return
            events.PushEvents * 2 +
            events.PullRequests * 3 +
            events.Issues * 1 +
            repo.RepoCount * 2 +
            repo.TotalStars / 5;
    }

    private EventStats CalculateEventStats(JsonElement eventsArray)
    {
        var pushEvents = 0;
        var prEvents = 0;
        var issueEvents = 0;
        var createEvents = 0;

        DateTime? lastActivity = null;

        foreach (var ev in eventsArray.EnumerateArray())
        {
            var type = ev.GetProperty("type").GetString();

            if (ev.TryGetProperty("created_at", out var createdAtProp))
                if (DateTime.TryParse(createdAtProp.GetString(), out var dt))
                    if (lastActivity == null || dt > lastActivity)
                        lastActivity = dt;

            switch (type)
            {
                case "PushEvent": pushEvents++; break;
                case "PullRequestEvent": prEvents++; break;
                case "IssuesEvent": issueEvents++; break;
                case "CreateEvent": createEvents++; break;
            }
        }

        return new EventStats
        {
            PushEvents = pushEvents,
            PullRequests = prEvents,
            Issues = issueEvents,
            CreateEvents = createEvents,
            LastActivity = lastActivity
        };
    }

    public class RepoStats
    {
        public int RepoCount { get; set; }
        public int TotalStars { get; set; }
        public int TotalForks { get; set; }
        public Dictionary<string, int> Languages { get; set; } = new();
    }

    public class EventStats
    {
        public int PushEvents { get; set; }
        public int PullRequests { get; set; }
        public int Issues { get; set; }
        public int CreateEvents { get; set; }
        public DateTime? LastActivity { get; set; }
    }
}