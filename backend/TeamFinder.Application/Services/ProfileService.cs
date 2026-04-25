using CSharpFunctionalExtensions;
using TeamFinder.Application.Abstractions;
using TeamFinder.Application.Mapping;
using TeamFinder.Core.Model;
using TeamFinder.Postgresql;
using TeamFinder.Postgresql.Abstractions;
using TeamFinder.Postgresql.Model;
using TeamFinder.Postgresql.Repositories;

namespace TeamFinder.Application.Services;

public class ProfileService : IProfileService
{
    private readonly IProfileRepository _profileRepository;
    private readonly ISkillRepository _skillRepository;


    public ProfileService(IProfileRepository profileRepository, ISkillRepository skillRepository)
    {
        _profileRepository = profileRepository;
        _skillRepository = skillRepository;
    }

    public async Task<Result<Guid>> DevCreateWithoutTg(string name)
    {
        var profile = Profile.Create(name, 1);
        if (profile.IsFailure) 
            return Result.Failure<Guid>(profile.Error);

        var profileEntity = profile.Value.ToEntity();
        await _profileRepository.Add(profileEntity);

        return profile.Value.Id;
    }

    public async Task<Result> AddSkill(Guid profileId, Guid skillId) 
        => await _profileRepository.AddSkill(profileId, skillId);
    
    public async Task<Result<Profile>> GetById(Guid id)
    {
        var profileEntity = await _profileRepository.GetById(id);
        if (profileEntity == null)
            return Result.Failure<Profile>("Profile not found");
        
        return profileEntity.ToDomain();
    }

    public async Task<Result<List<Profile>>> FindBySkill(Guid skillId)
    {
        //TODO rewrite
        var parenSkills = await _skillRepository.GetAllParents(skillId);
        var parentSkillIds = parenSkills.Value.Select(s => s.Id).ToList();
        parentSkillIds.AddRange(skillId);
        var profileEntities = await _profileRepository.FindBySkill(parentSkillIds);
        if(profileEntities.IsFailure)
            return  Result.Failure<List<Profile>>(profileEntities.Error);
        
        return profileEntities.Value.Select(p => p.ToDomain().Value).ToList();
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

        var profile = Profile.Create(name, tgId);
        if(profile.IsFailure)
            return Result.Failure<Profile>(profile.Error);

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