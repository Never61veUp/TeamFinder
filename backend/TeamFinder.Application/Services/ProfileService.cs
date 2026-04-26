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
        return await Profile.Create(name, 1)
            .Tap(profile => _profileRepository.Add(profile.ToEntity()))
            .Map(profile => profile.Id);
    }

    public async Task<Result> AddSkill(Guid profileId, Guid skillId) 
        => await _profileRepository.AddSkill(profileId, skillId);
    
    public async Task<Result> UpdateSkills(Guid profileId, List<Guid> skillId) 
        => await _profileRepository.UpdateSkills(profileId, skillId);
    
    public async Task<Result<Profile>> GetById(Guid id)
    {
        return await _profileRepository.GetById(id)
            .Bind(entity => entity.ToDomain());
    }

    public async Task<Result<List<Profile>>> FindBySkill(Guid skillId)
    {
        return await _skillRepository.GetAllParents(skillId)
            .Map(parents => parents.Select(s => s.Id).Append(skillId).ToList())
            .Bind(ids => _profileRepository.FindBySkill(ids))
            .Bind(entities => entities.MapToDomainList(p => p.ToDomain()));
    }

    public async Task<Result> ConnectGithub(Guid profileId, GithubInfo githubInfo)
    {
        return await GetById(profileId)
            .Check(profile => profile.ConnectGithubInfo(githubInfo))
            .Bind(profile => _profileRepository.ConnectGithubInfo(profileId, profile.GithubInfo!.ToEntity()));
    }

    public async Task<Result<Profile>> CreateOrGetByTgId(long tgId, string name)
    {
        return await GetByTgId(tgId)
            .OnFailureCompensate(() => 
                Profile.Create(name, tgId)
                    .Tap(profile => _profileRepository.Add(profile.ToEntity()))
            );
    }

    public async Task<Result<Profile>> GetWithGithubInfoById(Guid id)
    {
        return await _profileRepository.GetWithGithubStatsById(id)
            .Bind(profile => profile.ToDomain());
    }

    public async Task<Result<Profile>> GetByTgId(long tgId)
    {
        return await _profileRepository.GetByTgId(tgId)
            .Bind(profile => profile.ToDomain());
    }
    
    public async Task<Result> AddDescription(Guid profileId, string description)
    {
        return await GetById(profileId).Check(profile => profile.AddDescription(description))
            .Bind(profile => _profileRepository.UpdateDescription(profileId, description));
    }
}