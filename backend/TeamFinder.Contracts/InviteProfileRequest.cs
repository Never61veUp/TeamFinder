namespace TeamFinder.Contracts;

public record InviteProfileRequest(Guid TeamId, Guid InviteeId);