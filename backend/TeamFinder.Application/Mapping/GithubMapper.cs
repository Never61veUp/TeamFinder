using TeamFinder.Core.Model;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Application.Mapping;

public static class GithubMapper
{
    public static GithubInfo ToDomain(this GithubEntity entity)
    {
        return GithubInfo.Create(
            username: entity.Username,
            profileUrl: entity.ProfileUrl,
            topLanguage: entity.TopLanguage,
            totalStars: entity.TotalStars,
            repositoriesCount: entity.RepositoriesCount,
            githubId: entity.GithubId
        );
    }

    public static GithubEntity ToEntity(this GithubInfo domain)
    {
        return new GithubEntity
        {
            GithubId = domain.GithubId,
            Username = domain.Username,
            ProfileUrl = domain.ProfileUrl,
            TopLanguage = domain.TopLanguage,
            TotalStars = domain.TotalStars,
            RepositoriesCount = domain.RepositoriesCount
        };
    }
}