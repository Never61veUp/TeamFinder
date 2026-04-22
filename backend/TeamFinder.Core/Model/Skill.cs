using CSharpFunctionalExtensions;

namespace TeamFinder.Core.Model;

public class Skill : Entity<Guid>
{
    private Skill(Guid id, string name) : base(id)
    {
        Name = name;
    }

    public string Name { get; }

    public static Skill Create(Guid id, string name)
    {
        return new Skill(id, name);
    }
}