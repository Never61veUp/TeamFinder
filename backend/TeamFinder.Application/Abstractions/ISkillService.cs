using CSharpFunctionalExtensions;
using TeamFinder.Core.Model;

namespace TeamFinder.Application.Abstractions;

public interface ISkillService
{
    Task<List<Guid>> GetAllDescendants(Guid skillId);
    Task<Result> AddRelation(Guid parentId, Guid childId, double weight = 1D);
    Task<Result> AddSkill(string name);
    Task<Result<List<Skill>>> GetParents(Guid skillId);
    Task<Result<List<Skill>>> GetChildren(Guid skillId);
    Task<Result<List<string>>> GetSkillsTreeDev();
    Task<Result<List<Skill>>> GetAllSkills();
}