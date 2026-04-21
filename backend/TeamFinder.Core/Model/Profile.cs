using CSharpFunctionalExtensions;

namespace TeamFinder.Core.Model;

public sealed class Profile : Entity<Guid>
{
    private readonly List<Skill> _skills = [];

    public IReadOnlyCollection<Skill> Skills => _skills.AsReadOnly();
    public string Name { get; private set; }

    private Profile(Guid id, string name) : base(id)
    {
        Name = name;
    }

    public static Profile Create(Guid id, string name)
        => new Profile(id, name);

    public Result AddSkill(Skill skill)
    {
        if (_skills.Any(x => x.Id == skill.Id))
            return Result.Failure("Skill already added to profile");

        _skills.Add(skill);
        return Result.Success();
    }
}

public class Skill : Entity<Guid>
{
    public string Name { get; }

    private Skill(Guid id, string name) : base(id)
    {
        Name = name;
    }

    public static Skill Create(Guid id, string name)
        => new Skill(id, name);
}