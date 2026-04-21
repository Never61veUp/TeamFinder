namespace TeamFinder.Core.Model;

public class GithubInfo
{
    public string Username { get; }
    public string ProfileUrl { get; }
    public int RepositoriesCount { get; }
    public int TotalStars { get; }
    public string TopLanguage { get; }
    public int Score => 0; // Placeholder for future scoring logic

    private GithubInfo(string username, string profileUrl, string topLanguage, int totalStars, int repositoriesCount)
    {
        Username = username;
        ProfileUrl = profileUrl;
        TopLanguage = topLanguage;
        TotalStars = totalStars;
        RepositoriesCount = repositoriesCount;
    }

    public static GithubInfo Create(string username, string profileUrl, string topLanguage, int totalStars, int repositoriesCount)
    {
        
        return new GithubInfo(username, profileUrl, topLanguage, totalStars, repositoriesCount);
    }
}