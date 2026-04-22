namespace TeamFinder.Postgresql.Model;

public class ProfileEntity
{
    public Guid Id { get; set; }
    public string UserName { get; set; } = null!;
    public GithubEntity? GithubInfo { get; set; }
    public long TgId { get; set; }

    public ICollection<ProfileSkillEntity> Skills { get; set; } = new List<ProfileSkillEntity>();
}