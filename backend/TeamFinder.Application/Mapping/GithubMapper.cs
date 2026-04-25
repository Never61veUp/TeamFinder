using TeamFinder.Core.Model;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Application.Mapping;

public static class GithubMapper
{
    public static GithubInfo ToDomain(this GithubEntity entity)
    {
        return GithubInfo.Create(
            entity.Username,
            entity.ProfileUrl,
            entity.TopLanguage,
            entity.TotalStars,
            entity.RepositoriesCount,
            entity.GithubId
        ).Value;
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