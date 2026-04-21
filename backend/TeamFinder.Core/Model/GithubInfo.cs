namespace TeamFinder.Core.Model;

public class GithubInfo
{
    public string Username { get; }
    public string ProfileUrl { get; }
    public int RepositoriesCount { get; }
    public int TotalStars { get; }
    public string TopLanguage { get; }
    public string GithubId { get; }
    public int Score => 0; // Placeholder for future scoring logic

    private GithubInfo(string username, string profileUrl, string topLanguage, int totalStars, int repositoriesCount, string githubId)
    {
        Username = username;
        ProfileUrl = profileUrl;
        TopLanguage = topLanguage;
        TotalStars = totalStars;
        RepositoriesCount = repositoriesCount;
        GithubId = githubId;
    }

    public static GithubInfo Create(string username, string profileUrl, string topLanguage, int totalStars, int repositoriesCount, string githubId)
    {
        
        return new GithubInfo(username, profileUrl, topLanguage, totalStars, repositoriesCount, githubId);
    }
}