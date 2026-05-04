using TeamFinder.Core.Model.Teams;

namespace TeamFinder.Contracts;

public record TeamsResponse(
    string Name,
    Guid OwnerId,
    IReadOnlyCollection<Guid> Members,
    int MaxMembers,
    string Description,
    EventDetails EventDetails,
    int Status,
    Guid Id,
    double AverageRating
);