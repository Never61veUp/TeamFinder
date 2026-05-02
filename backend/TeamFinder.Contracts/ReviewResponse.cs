namespace TeamFinder.Contracts;

public record ReviewResponse(Guid Id,
    Guid ReviewerId,
    string ReviewerName,
    int Rating,
    string Comment,
    DateTime CreatedAt);