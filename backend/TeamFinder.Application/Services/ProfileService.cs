using CSharpFunctionalExtensions;
using TeamFinder.Application.Mapping;
using TeamFinder.Core.Model;
using TeamFinder.Postgresql;
using TeamFinder.Postgresql.Model;
using TeamFinder.Postgresql.Repositories;

namespace TeamFinder.Application.Services;

public interface IProfileService
{
    Task<Result<Guid>> Create(string name);
    Task<List<Profile>> GetBySkill(Guid skillId);
    Task<Result<Profile>> GetById(Guid id);
    Task<Result> AddSkill(Guid profileId, Guid skillId);
    Task<List<Profile>> FindBySkill(Guid skillId);
}

public class ProfileService : IProfileService
{
    private readonly IProfileRepository _repo;
    private readonly ISkillRepository _skillRepository;
    

    public ProfileService(IProfileRepository repo, ISkillRepository skillRepository)
    {
        _repo = repo;
        _skillRepository = skillRepository;
    }

    public async Task<Result<Guid>> Create(string name)
    {
        var profile = Profile.Create(Guid.NewGuid(), name);

        var profileEntity = profile.ToEntity();
        
        await _repo.Add(profileEntity);

        return profile.Id;
    }
    
    public async Task<Result> AddSkill(Guid profileId, Guid skillId)
    {
        var profileEntity = await _repo.GetById(profileId);
        if (profileEntity == null)
            return Result.Failure("Profile not found");
        
        var profile = profileEntity.ToDomain();
        
        var skillEntity = await _skillRepository.GetSkillById(skillId);
        if(skillEntity.IsFailure)
            return Result.Failure("Skill not found");
        
        var skill = skillEntity.Value.ToDomain();
        var addingResult = profile.AddSkill(skill);
        if(addingResult.IsFailure)
            return Result.Failure(addingResult.Error);
        
        var profileSkill = new ProfileSkillEntity 
        {
            ProfileId = profileId,
            SkillId = skillId
        };
        
        profileEntity.Skills.Add(profileSkill);
        
        var result = await _repo.Update(profileEntity);
        if(result.IsFailure)
            return Result.Failure(result.Error);
        return Result.Success();
    }
    
    public async Task<Result<Profile>> GetById(Guid id)
    {
        var profileEntity = await _repo.GetById(id);
        if (profileEntity == null)
            return Result.Failure<Profile>("Profile not found");
        return profileEntity.ToDomain();
    }
    
    public async Task<List<Profile>> GetBySkill(Guid skillId)
    {
        var profileEntities = await _repo.GetProfilesBySkillAsync(skillId);
        return profileEntities.Select(p => Profile.Create(p.Id, p.UserName)).ToList();
    }
    
    public async Task<List<Profile>> FindBySkill(Guid skillId)
    {
        var expandedSkills = await _skillRepository.GetByParentId(skillId);
        
        var profiles = await _repo.GetAll();
        
        var profileEntities =  profiles
            .Where(p => p.Skills.Any(s =>
                expandedSkills.Contains(s.SkillId)))
            .ToList();
        return profileEntities.Select(p => Profile.Create(p.Id, p.UserName)).ToList();
    }
}