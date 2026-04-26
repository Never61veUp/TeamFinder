using CSharpFunctionalExtensions;
using TeamFinder.Application.Abstractions;
using TeamFinder.Application.Mapping;
using TeamFinder.Core.Model;
using TeamFinder.Postgresql;
using TeamFinder.Postgresql.Abstractions;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Application.Services;

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
        return await _skillRepository.AddRelation(parentId, childId, weight);
    }

    public async Task<Result> AddSkill(string name)
    {
        return await Skill.Create(name)
            .Map(skill => skill.ToEntity())
            .Bind(entity => _skillRepository.AddSkill(entity));
    }

    public async Task<Result<List<Skill>>> GetParents(Guid skillId)
    {
        return await _skillRepository.GetAllParents(skillId)
            .Bind(entities => entities.MapToDomainList(s => s.ToDomain()));
    }

    public async Task<Result<List<Skill>>> GetChildren(Guid skillId)
    {
        return await _skillRepository.GetAllChildren(skillId)
            .Bind(entities => entities.MapToDomainList(s => s.ToDomain()));
    }

    public async Task<Result<List<string>>> GetSkillsTreeDev()
    {
        return await _skillRepository.GetSkillTreeDev();
    }

    public async Task<Result<List<Skill>>> GetAllSkills()
    {
        return await _skillRepository.GetAllSkills()
            .Bind(entities => entities.MapToDomainList(s => s.ToDomain()));
    }
}