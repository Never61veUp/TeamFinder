using TeamFinder.Core.Model;

namespace TeamFinder.Postgresql;

public interface ISkillRelationRepository
{
    Task<List<SkillRelation>> GetByParentId(Guid parentId);
}