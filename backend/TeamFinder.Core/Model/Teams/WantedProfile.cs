using CSharpFunctionalExtensions;

namespace TeamFinder.Core.Model.Teams;

public class WantedProfile : Entity<Guid>
{
    private readonly List<Guid> _requiredSkills;

    private WantedProfile(Guid id, List<Guid> requiredSkills) : base(id)
    {
        _requiredSkills = requiredSkills.Distinct().ToList();
    }

    public IReadOnlyList<Guid> RequiredSkills => _requiredSkills.AsReadOnly();

    public static Result<WantedProfile> Create(Guid id, List<Guid> requiredSkills)
    {
        if (requiredSkills.Count == 0)
            return Result.Failure<WantedProfile>("Required skills must be > 0");
        
        return new WantedProfile(id, requiredSkills);
    }

    public Result AddSkill(Guid skillId)
    {
        if (_requiredSkills.Contains(skillId))
            return Result.Failure<Guid>("Skill already exists");
        
        _requiredSkills.Add(skillId);
        
        return Result.Success(skillId);
    }
    //TODO: Add more criteria like experience level, location, etc.
}