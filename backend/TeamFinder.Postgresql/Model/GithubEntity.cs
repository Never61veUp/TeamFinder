namespace TeamFinder.Postgresql.Model;

public class GithubEntity
{
    public Guid Id { get; set; }
    public string Username { get; set; } = null!;
    public string ProfileUrl { get; set; } = null!;
    public int RepositoriesCount { get; set; }
    public int TotalStars { get; set; }
    public string TopLanguage { get; set; } = null!;
}