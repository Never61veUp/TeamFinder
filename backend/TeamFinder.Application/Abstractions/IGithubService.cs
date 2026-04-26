using CSharpFunctionalExtensions;
using TeamFinder.Core.Model;

namespace TeamFinder.Application.Abstractions;

public interface IGithubService
{
    Task<Result<GithubInfo>> CreateGithubInfo(string githubId, string username, string accessToken);
}