namespace TeamFinder.Contracts;

public record CreateTeamRequest(string TeamName, int MaxMembers, string? Description, string? EventName, List<Tag> Tags);

public enum Tag
{
    Mobile,
    Web,
    Desktop,
    GameDev,
    DataScience,
    AI,
    VR,
    AR,
}