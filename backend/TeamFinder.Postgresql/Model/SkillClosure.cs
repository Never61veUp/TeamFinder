namespace TeamFinder.Postgresql.Model;

public class SkillClosure
{
    public Guid AncestorId { get; set; }
    public SkillEntity Ancestor { get; set; } = null!;

    public Guid DescendantId { get; set; }
    public SkillEntity Descendant { get; set; } = null!;

    public int Depth { get; set; }
}