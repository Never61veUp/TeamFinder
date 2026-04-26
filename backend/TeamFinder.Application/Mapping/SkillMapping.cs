using CSharpFunctionalExtensions;
using TeamFinder.Core.Model;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Application.Mapping;

public static class SkillMapping
{
    public static Result<Skill> ToDomain(this SkillEntity entity)
    {
        return Skill.Restore(entity.Id, entity.Name);
    }

    public static SkillEntity ToEntity(this Skill domain)
    {
        return new SkillEntity
        {
            Id = domain.Id,
            Name = domain.Name
        };
    }
    
    public static Result<List<Skill>> MapToDomainList(this IEnumerable<SkillEntity> entities)
    {
        return entities
            .Select(e => e.ToDomain())
            .Combine()
            .Map(skills => skills.ToList());
    }
}