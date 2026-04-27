using CSharpFunctionalExtensions;

namespace TeamFinder.Core.Model;

public class GithubInfo : ValueObject<GithubInfo>
{
    private GithubInfo(string username, string profileUrl, string topLanguage, int totalStars, int repositoriesCount,
        string githubId)
    {
        Username = username;
        ProfileUrl = profileUrl;
        TopLanguage = topLanguage;
        TotalStars = totalStars;
        RepositoriesCount = repositoriesCount;
        GithubId = githubId;
    }

    public string Username { get; }
    public string ProfileUrl { get; }
    public int RepositoriesCount { get; }
    public int TotalStars { get; }
    public string TopLanguage { get; }
    public string GithubId { get; }
    public int Score => 0; // Placeholder for future scoring logic

    public static Result<GithubInfo> Create(string username, string profileUrl, string topLanguage, int totalStars,
        int repositoriesCount, string githubId)
    {
        if (totalStars < 0 || repositoriesCount < 0) 
            return Result.Failure<GithubInfo>("Stats cannot be negative");
        
        return new GithubInfo(username, profileUrl, topLanguage, totalStars, repositoriesCount, githubId);
    }

    protected override bool EqualsCore(GithubInfo other)
    {
        return Username == other.Username &&
               ProfileUrl == other.ProfileUrl &&
               TopLanguage == other.TopLanguage &&
               TotalStars == other.TotalStars &&
               RepositoriesCount == other.RepositoriesCount &&
               GithubId == other.GithubId;
    }

    protected override int GetHashCodeCore()
    {
        return HashCode.Combine(
            Username, 
            ProfileUrl, 
            TopLanguage, 
            TotalStars, 
            RepositoriesCount, 
            GithubId
        );
    }
}