using TeamFinder.Core.Model.Teams;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Application.Mapping;

public static class InvitationMapping
{
    public static InvitationEntity MapToEntity(this Invitation invitation)
    {
        return new InvitationEntity
        {
            Id = invitation.Id,
            InviteeId = invitation.InviteeId,
            InvitedBy = invitation.InvitedBy,
            Status = invitation.Status.ToString(),
            ExpiresAt = invitation.ExpiresAt
        };
    }
    
    public static Invitation MapToDomain(this InvitationEntity e)
    {
        return Invitation.Restore(
            e.Id, 
            e.InviteeId, 
            e.InvitedBy, 
            Enum.Parse<InvitationStatus>(e.Status), 
            e.ExpiresAt);
    }
}