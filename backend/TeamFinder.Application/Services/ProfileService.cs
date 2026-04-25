using CSharpFunctionalExtensions;
using TeamFinder.Application.Mapping;
using TeamFinder.Core.Model;
using TeamFinder.Postgresql;
using TeamFinder.Postgresql.Abstractions;
using TeamFinder.Postgresql.Model;
using TeamFinder.Postgresql.Repositories;

namespace TeamFinder.Application.Services;

public interface IProfileService
{
    Task<Result<Guid>> Create(string name);
    Task<Result<List<Profile>>> GetBySkill(Guid skillId);
    Task<Result<Profile>> GetById(Guid id);
    Task<Result> AddSkill(Guid profileId, Guid skillId);
    Task<List<Profile>> FindBySkill(Guid skillId);
    Task<Result> ConnectGithub(Guid profileId, GithubInfo githubInfo);
    Task<Result<Profile>> CreateOrGetByTgId(long tgId, string name);
    Task<Result<Profile>> GetWithGithubInfoById(Guid id);
}

public class ProfileService : IProfileService
{
    private readonly IProfileRepository _profileRepository;
    private readonly ISkillRepository _skillRepository;


    public ProfileService(IProfileRepository profileRepository, ISkillRepository skillRepository)
    {
        _profileRepository = profileRepository;
        _skillRepository = skillRepository;
    }

    public async Task<Result<Guid>> Create(string name)
    {
        var profile = Profile.Create(name);
        if (profile.IsFailure) 
            return Result.Failure<Guid>(profile.Error);

        var profileEntity = profile.Value.ToEntity();
        await _profileRepository.Add(profileEntity);

        return profile.Value.Id;
    }

    public async Task<Result> AddSkill(Guid profileId, Guid skillId)
    {
        var profileEntity = await _profileRepository.GetById(profileId);
        if (profileEntity == null)
            return Result.Failure("Profile not found");

        var profile = profileEntity.ToDomain();
        if(profile.IsFailure)
            return Result.Failure(profile.Error);

        var skillEntity = await _skillRepository.GetSkillById(skillId);
        if (skillEntity.IsFailure)
            return Result.Failure("Skill not found");

        var skill = skillEntity.Value.ToDomain();
        if(skill.IsFailure)
            return Result.Failure(skill.Error);
        
        var addingResult = profile.Value.AddSkill(skill.Value);
        if (addingResult.IsFailure)
            return Result.Failure(addingResult.Error);

        var profileSkill = new ProfileSkillEntity
        {
            ProfileId = profileId,
            SkillId = skillId
        };

        profileEntity.Skills.Add(profileSkill);

        var result = await _profileRepository.Update(profileEntity);
        if (result.IsFailure)
            return Result.Failure(result.Error);
        return Result.Success();
    }

    public async Task<Result<Profile>> GetById(Guid id)
    {
        var profileEntity = await _profileRepository.GetById(id);
        if (profileEntity == null)
            return Result.Failure<Profile>("Profile not found");
        return profileEntity.ToDomain();
    }

    public async Task<Result<List<Profile>>> GetBySkill(Guid skillId)
    {
        var profileEntities = await _profileRepository.GetProfilesBySkillAsync(skillId);
        var profiles = profileEntities.Select(p => p.ToDomain()).ToList();
        
        return Result.Combine(profiles)
            .Map(() => profiles.Select(r => r.Value).ToList());
    }

    public async Task<List<Profile>> FindBySkill(Guid skillId)
    {
        var expandedSkills = await _skillRepository.GetByParentId(skillId);

        var profiles = await _profileRepository.GetAll();

        var profileEntities = profiles
            .Where(p => p.Skills.Any(s =>
                expandedSkills.Contains(s.SkillId)))
            .ToList();
        return profileEntities.Select(p => Profile.Restore(p.Id, p.UserName, p.TgId)).ToList();
        //TODO: Переписать await _profileRepository.GetAll(), маппинг резалтов (не тянуть все профили)
    }

    public async Task<Result> ConnectGithub(Guid profileId, GithubInfo githubInfo)
    {
        var profile = await GetById(profileId);
        if (profile.IsFailure)
            return Result.Failure(profile.Error);

        var result = profile.Value.ConnectGithubInfo(githubInfo);
        if (result.IsFailure || profile.Value.GithubInfo == null)
            return Result.Failure(result.Error);
        var githubEntity = profile.Value.GithubInfo.ToEntity();
        var saveResult = await _profileRepository.ConnectGithubInfo(profileId, githubEntity);
        if (saveResult.IsFailure)
            return Result.Failure(saveResult.Error);
        return Result.Success();
    }

    public async Task<Result<Profile>> CreateOrGetByTgId(long tgId, string name)
    {
        var existingProfile = await GetByTgId(tgId);
        if (existingProfile.IsSuccess)
            return Result.Success(existingProfile.Value);

        var profile = Profile.Create(name);
        if(profile.IsFailure)
            return Result.Failure<Profile>(profile.Error);
        
        var addingTgResult = profile.Value.AddTelegramId(tgId);
        if (addingTgResult.IsFailure)
            return Result.Failure<Profile>(addingTgResult.Error);

        var profileEntity = profile.Value.ToEntity();
        var saveResult = await _profileRepository.Add(profileEntity);

        return saveResult.IsFailure 
            ? Result.Failure<Profile>(saveResult.Error) 
            : Result.Success(profile.Value);
    }

    public async Task<Result<Profile>> GetWithGithubInfoById(Guid id)
    {
        var profileEntity = await _profileRepository.GetWithGithubStatsById(id);
        if (profileEntity == null)
            return Result.Failure<Profile>("Profile not found");
        return profileEntity.ToDomain();
    }

    public async Task<Result<Profile>> GetByTgId(long tgId)
    {
        var profileEntity = await _profileRepository.GetByTgId(tgId);
        if (profileEntity.IsFailure)
            return Result.Failure<Profile>(profileEntity.Error);
        return profileEntity.Value.ToDomain();
    }
}