using CSharpFunctionalExtensions;
using TeamFinder.Core.Model;

namespace TeamFinder.Application.Abstractions;

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