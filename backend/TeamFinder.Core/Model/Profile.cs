using CSharpFunctionalExtensions;

namespace TeamFinder.Core.Model;

public sealed class Profile : Entity<Guid>
{
    private readonly List<Skill> _skills = [];

    private Profile(Guid id, string name, long tgId) : base(id)
    {
        Name = name;
        TelegramId = tgId;
    }

    public IReadOnlyCollection<Skill> Skills => _skills.AsReadOnly();
    public string Name { get; private set; }
    public GithubInfo? GithubInfo { get; private set; }
    public long TelegramId { get; private set; }
    public string Description {get; private set;}

    public static Result<Profile> Create(string name, long tgId)
    {
        if(string.IsNullOrWhiteSpace(name))
            return Result.Failure<Profile>("Profile name cannot be empty");
        
        return new Profile(Guid.NewGuid(), name, tgId);
    }
    public static Profile Restore(Guid id, string name, long tgId, GithubInfo? githubInfo = null, List<Skill>? skills = null, string description = "")
    {
        var profile = new Profile(id, name, tgId)
        {
            GithubInfo = githubInfo,
            Description = description
        };

        if (skills != null)
            profile._skills.AddRange(skills);

        return profile;
    }

    public Result AddSkill(Skill skill)
    {
        if (_skills.Any(x => x.Id == skill.Id))
            return Result.Failure("Skill already added to profile");

        _skills.Add(skill);
        return Result.Success();
    }

    public Result ConnectGithubInfo(GithubInfo githubInfo)
    {
        if (GithubInfo != null)
            return Result.Failure("Profile already has connected Github info");

        GithubInfo = githubInfo;
        return Result.Success();
    }

    public Result AddTelegramId(long tgId)
    {
        if (TelegramId != 0)
            return Result.Failure("Profile already has connected Telegram ID");

        TelegramId = tgId;
        return Result.Success();
    }
    
    public Result AddDescription(string description)
    {
        if (string.IsNullOrWhiteSpace(description))
            return Result.Failure("Description cannot be empty");
        if(description.Length > 100)
            return Result.Failure("Description cannot be longer than 100 characters");

        Description = description;
        return Result.Success();
    }
}