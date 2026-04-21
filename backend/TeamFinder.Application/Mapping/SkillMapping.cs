using TeamFinder.Core.Model;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Application.Services;

public static class SkillMapping
{
    public static Skill ToDomain(this SkillEntity entity)
        => Skill.Create(entity.Id, entity.Name);

    public static SkillEntity ToEntity(this Skill domain)
        => new SkillEntity
        {
            Id = domain.Id,
            Name = domain.Name
        };
}