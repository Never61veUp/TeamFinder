using TeamFinder.Core.Model;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Application.Mapping;

public static class SkillMapping
{
    public static Skill ToDomain(this SkillEntity entity)
    {
        return Skill.Create(entity.Id, entity.Name);
    }

    public static SkillEntity ToEntity(this Skill domain)
    {
        return new SkillEntity
        {
            Id = domain.Id,
            Name = domain.Name
        };
    }
}