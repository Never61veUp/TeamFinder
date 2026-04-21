namespace TeamFinder.Postgresql.Model;

public class SkillEntity
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
}
public class SkillClosure
{
    public Guid AncestorId { get; set; }
    public SkillEntity Ancestor { get; set; } = null!;

    public Guid DescendantId { get; set; }
    public SkillEntity Descendant { get; set; } = null!;

    public int Depth { get; set; }
}
public class ProfileSkillEntity
{
    public Guid ProfileId { get; set; }
    public ProfileEntity Profile { get; set; } = null!;

    public Guid SkillId { get; set; }
    public SkillEntity Skill { get; set; } = null!;

    public int Level { get; set; }
}

public class ProfileEntity
{
    public Guid Id { get; set; }
    public string UserName { get; set; } = null!;

    public ICollection<ProfileSkillEntity> Skills { get; set; } = new List<ProfileSkillEntity>();
}