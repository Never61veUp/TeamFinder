using CSharpFunctionalExtensions;

namespace TeamFinder.Core.Model;

public class Profile : Entity<Guid>
{
    private readonly HashSet<Guid> _skillIds = [];

    public IReadOnlyCollection<Guid> SkillIds => _skillIds;

    private Profile() { }

    public void AddSkill(Guid skillId)
    {
        _skillIds.Add(skillId);
    }
}

public class Skill : Entity<Guid>
{
    public string Name { get; }

    public Skill(string name)
    {
        Name = name;
    }

}

public class SkillRelation
{
    public Guid Id { get; private set; }

    public Guid ParentSkillId { get; private set; }
    public Guid ChildSkillId { get; private set; }

    public double Weight { get; private set; }
}