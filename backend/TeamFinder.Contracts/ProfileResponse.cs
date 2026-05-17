using TeamFinder.Core.Model;

namespace TeamFinder.Contracts;

public record ProfileResponse(
    Guid Id,
    string Name,
    string UserName,
    string Description,
    long TelegramId,
    double Rating,
    int ReviewsCount,
    List<Skill> Skills,
    GithubInfo? GitHubInfo
);