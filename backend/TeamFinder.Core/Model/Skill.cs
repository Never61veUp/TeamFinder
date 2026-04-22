using CSharpFunctionalExtensions;

namespace TeamFinder.Core.Model;

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