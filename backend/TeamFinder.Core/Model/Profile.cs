using CSharpFunctionalExtensions;

namespace TeamFinder.Core.Model;

public sealed class Profile : Entity<Guid>
{
    private readonly List<Skill> _skills = [];

    public IReadOnlyCollection<Skill> Skills => _skills.AsReadOnly();
    public string Name { get; private set; }
    public GithubInfo? GithubInfo { get; private set; }

    private Profile(Guid id, string name, GithubInfo? githubInfo) : base(id)
    {
        Name = name;
        GithubInfo = githubInfo;
    }

    public static Profile Create(Guid id, string name, GithubInfo? githubInfo = null)
        => new Profile(id, name, githubInfo);

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
}