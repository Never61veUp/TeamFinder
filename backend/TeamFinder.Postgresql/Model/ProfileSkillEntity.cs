namespace TeamFinder.Postgresql.Model;

public class ProfileSkillEntity
{
    public Guid ProfileId { get; set; }
    public ProfileEntity Profile { get; set; } = null!;

    public Guid SkillId { get; set; }
    public SkillEntity Skill { get; set; } = null!;

    public int Level { get; set; }
}