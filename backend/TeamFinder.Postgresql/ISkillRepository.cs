using CSharpFunctionalExtensions;
using TeamFinder.Core.Model;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Postgresql;

public interface ISkillRepository
{
    Task<List<Guid>> GetByParentId(Guid skillId);
    Task<Result> AddRelation(Guid parentId, Guid childId, double weight = 1);
    Task<Result> AddSkill(SkillEntity skillEntity);
    Task<Result<SkillEntity>> GetSkillById(Guid skillId);
    Task<Result<List<SkillEntity>>> GetAllParents(Guid skillId);
    Task<Result<List<SkillEntity>>> GetAllChildren(Guid skillId);
    Task<List<string>> GetSkillTreeDev();
}