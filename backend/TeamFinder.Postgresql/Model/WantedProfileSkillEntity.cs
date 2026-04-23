namespace TeamFinder.Postgresql.Model;

public class WantedProfileSkillEntity
{
    public Guid Id { get; set; }
    public Guid WantedProfileId { get; set; }
    public WantedProfileEntity WantedProfile { get; set; } = null!;
    public Guid SkillId { get; set; }
}