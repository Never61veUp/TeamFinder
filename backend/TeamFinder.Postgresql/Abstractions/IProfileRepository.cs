using CSharpFunctionalExtensions;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Postgresql.Abstractions;

public interface IProfileRepository
{
    Task<ProfileEntity?> GetById(Guid id);
    Task<List<ProfileEntity>> GetAll();
    Task<Result> Add(ProfileEntity profile);
    Task<List<ProfileEntity>> GetProfilesBySkillAsync(Guid ancestorSkillId);
    Task<Result> Update(ProfileEntity profile);
    Task<Result> ConnectGithubInfo(Guid profileId, GithubEntity githubInfo);
    Task<Result<ProfileEntity>> GetByTgId(long tgId);
    Task<ProfileEntity?> GetWithGithubStatsById(Guid id);
    Task<Result> AddSkill(Guid profileId, Guid skillId);
    Task<Result<List<ProfileEntity>>> FindBySkill(List<Guid> skillIds);
}