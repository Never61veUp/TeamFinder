using CSharpFunctionalExtensions;
using TeamFinder.Core.Model;
using TeamFinder.Postgresql;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Application.Services;

public interface ISkillService
{
    Task<List<Guid>> GetAllDescendants(Guid skillId);
    Task<Result> AddRelation(Guid parentId, Guid childId, double weight = 1D);
    Task<Result> AddSkill(string name);
    Task<Result<List<Skill>>> GetParents(Guid skillId);
    Task<Result<List<Skill>>> GetChildren(Guid skillId);
    Task<Result<List<string>>> GetSkillsTreeDev();
}

public class SkillService : ISkillService
{
    private readonly ISkillRepository _skillRepository;

    public SkillService(ISkillRepository skillRepository)
    {
        _skillRepository = skillRepository;
    }

    public Task<List<Guid>> GetAllDescendants(Guid skillId)
    {
        return _skillRepository.GetByParentId(skillId);
    }

    public async Task<Result> AddRelation(Guid parentId, Guid childId, double weight = 1)
    {
        var result = await _skillRepository.AddRelation(parentId, childId, weight);
        if (result.IsFailure)
            return Result.Failure(result.Error);
        
        return Result.Success();
    }
    
    public Task<Result> AddSkill(string name)
    {
        var skill = Skill.Create(Guid.NewGuid(), name);
        var skillEntity = skill.ToEntity();
        return _skillRepository.AddSkill(skillEntity);
    }
    
    public async Task<Result<List<Skill>>> GetParents(Guid skillId)
    {
        var parents = await _skillRepository.GetAllParents(skillId);
        if (parents.IsFailure)
            return Result.Failure<List<Skill>>(parents.Error);

        var result = parents.Value.Select(p => p.ToDomain()).ToList();
        
        return Result.Success(result);
    }
    
    public async Task<Result<List<Skill>>> GetChildren(Guid skillId)
    {
        var children = await _skillRepository.GetAllChildren(skillId);
        if (children.IsFailure)
            return Result.Failure<List<Skill>>(children.Error);
        
        var result = children.Value.Select(c => c.ToDomain()).ToList();
        
        return Result.Success(result);
    }

    public async Task<Result<List<string>>> GetSkillsTreeDev()
    {
        return await _skillRepository.GetSkillTreeDev();
    }
    
}