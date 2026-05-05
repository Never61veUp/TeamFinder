using CSharpFunctionalExtensions;
using TeamFinder.Contracts;
using TeamFinder.Core.Model;

namespace TeamFinder.Application.Abstractions;

public interface IProfileService
{
    Task<Result<Guid>> DevCreateWithoutTg(string name);
    Task<Result<Profile>> GetById(Guid id);
    Task<Result> AddSkill(Guid profileId, Guid skillId);
    Task<Result<List<Profile>>> FindBySkill(Guid skillId);
    Task<Result> ConnectGithub(Guid profileId, GithubInfo githubInfo);
    Task<Result<Profile>> CreateOrGetByTgId(long tgId, string name);
    Task<Result<Profile>> GetWithGithubInfoById(Guid id);
    Task<Result> AddDescription(Guid profileId, string description);
    Task<Result> UpdateSkills(Guid profileId, List<Guid> skillId);
    Task<Result<Profile>> GetProfileByName(string name);
    Task<Result<PagedResult<Profile>>> GetList(int from = 0, int count = 5);
}