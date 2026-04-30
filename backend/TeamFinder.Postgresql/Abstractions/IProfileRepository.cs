using CSharpFunctionalExtensions;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Postgresql.Abstractions;

public interface IProfileRepository
{
    Task<Result<ProfileEntity>> GetById(Guid id);
    Task<List<ProfileEntity>> GetAll();
    Task<Result> Add(ProfileEntity profile);
    Task<List<ProfileEntity>> GetProfilesBySkillAsync(Guid ancestorSkillId);
    Task<Result> Update(ProfileEntity profile);
    Task<Result> ConnectGithubInfo(Guid profileId, GithubEntity githubInfo);
    Task<Result<ProfileEntity>> GetByTgId(long tgId);
    Task<Result<ProfileEntity>> GetWithGithubStatsById(Guid id);
    Task<Result> AddSkill(Guid profileId, Guid skillId);
    Task<Result<List<ProfileEntity>>> FindBySkill(List<Guid> skillIds);
    Task<Result> UpdateDescription(Guid profileId, string description);
    Task<Result> UpdateSkills(Guid profileId, List<Guid> skillIds);
    Task<Result<ProfileEntity>> FindByProfileName(string name);
}