using TeamFinder.Core.Model;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Application.Services;

public static class ProfileMapping
{
    public static Profile ToDomain(this ProfileEntity entity)
    {
        var profile = Profile.Create(entity.Id, entity.UserName);

        foreach (var skill in entity.Skills)
        {
            profile.AddSkill(skill.Skill.ToDomain());
        }

        return profile;
    }

    public static ProfileEntity ToEntity(this Profile domain)
    {
        return new ProfileEntity
        {
            Id = domain.Id,
            UserName = domain.Name,
            Skills = domain.Skills
                .Select(s => new ProfileSkillEntity
                {
                    ProfileId = domain.Id,
                    SkillId = s.Id
                })
                .ToList()
        };
    }
}