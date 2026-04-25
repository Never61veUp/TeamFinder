using CSharpFunctionalExtensions;

namespace TeamFinder.Core.Model;

public class Skill : Entity<Guid>
{
    private Skill(Guid id, string name) : base(id)
    {
        Name = name;
    }

    public string Name { get; }

    public static Result<Skill> Create(Guid id, string name)
    {
        if(string.IsNullOrWhiteSpace(name))
            return Result.Failure<Skill>("Name cannot be empty");
        
        return new Skill(id, name);
    }
}