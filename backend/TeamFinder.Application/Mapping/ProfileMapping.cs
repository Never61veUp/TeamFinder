using CSharpFunctionalExtensions;
using TeamFinder.Application.Services;
using TeamFinder.Core.Model;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Application.Mapping;

public static class ProfileMapping
{
    public static Result<Profile> ToDomain(this ProfileEntity entity)
    {
        GithubInfo? githubInfo = null;
        if (entity.GithubInfo != null)
        {
            var githubResult = GithubInfo.Create(
                entity.UserName, 
                entity.GithubInfo.ProfileUrl,
                entity.GithubInfo.TopLanguage, 
                entity.GithubInfo.TotalStars, 
                entity.GithubInfo.RepositoriesCount, 
                entity.GithubInfo.GithubId);

            if (githubResult.IsFailure) 
                return Result.Failure<Profile>($"Invalid GitHubInfo while mapping to domain: {githubResult.Error}");
            githubInfo = githubResult.Value;
        }
        
        var skills = new List<Skill>();
        foreach (var s in entity.Skills)
        {
            var skillResult = s.Skill.ToDomain();
            
            if (skillResult.IsFailure) 
                return Result.Failure<Profile>($"Invalid Skill while mapping to domain: {skillResult.Error}");
            
            skills.Add(skillResult.Value);
        }
        
        var profile = Profile.Restore(
            entity.Id,
            entity.UserName,
            githubInfo,
            entity.TgId,
            skills);

        return Result.Success(profile);
    }

    public static ProfileEntity ToEntity(this Profile domain)
    {
        var profileEntity = new ProfileEntity
        {
            Id = domain.Id,
            UserName = domain.Name,
            TgId = domain.TelegramId,
            Skills = domain.Skills
                .Select(s => new ProfileSkillEntity
                {
                    ProfileId = domain.Id,
                    SkillId = s.Id
                })
                .ToList()
        };
        
        if (domain.GithubInfo != null)
        {
            profileEntity.GithubInfo = domain.GithubInfo.ToEntity();
        }
        
        return profileEntity;
    }
}