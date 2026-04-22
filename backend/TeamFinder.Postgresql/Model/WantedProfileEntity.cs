namespace TeamFinder.Postgresql.Model;

public class WantedProfileEntity
{
    public Guid Id { get; set; }
    public Guid TeamId { get; set; }
    public TeamEntity Team { get; set; } = null!;
    public List<WantedProfileSkillEntity> RequiredSkills { get; set; } = new();
}