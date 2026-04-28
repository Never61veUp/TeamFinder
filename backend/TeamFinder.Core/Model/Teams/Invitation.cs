using CSharpFunctionalExtensions;

namespace TeamFinder.Core.Model.Teams;

public class Invitation : Entity<Guid>
{
    private Invitation(Guid id, Guid inviteeId, Guid invitedBy, Guid teamId, DateTime? expiresAt = null) : base(id)
    {
        InviteeId = inviteeId;
        InvitedBy = invitedBy;
        TeamId = teamId;
        Status = InvitationStatus.Pending;
        ExpiresAt = expiresAt;
    }

    public Guid InviteeId { get; }
    public Guid InvitedBy { get; private set; }
    public InvitationStatus Status { get; private set; }
    public Guid TeamId { get; private set; }
    public DateTime? ExpiresAt { get; }

    public static Result<Invitation> Create(Guid inviteeId, Guid invitedBy,Guid teamId, DateTime? expiresAt = null)
    {
        if (expiresAt.HasValue && expiresAt <= DateTime.UtcNow)
            return Result.Failure<Invitation>("Invitation is expired");

        return new Invitation(Guid.NewGuid(), inviteeId, invitedBy, teamId, expiresAt);
    }
    
    public static Invitation Restore(Guid id, Guid inviteeId, Guid invitedBy, InvitationStatus status, Guid teamId, DateTime? expiresAt)
    {
        var invitation = new Invitation(id, inviteeId, invitedBy, teamId, expiresAt)
        {
            Status = status
        };
        return invitation;
    }

    public Result Accept()
    {
        if (Status != InvitationStatus.Pending)
            return Result.Failure("Invitation is not pending");
        
        if (ExpiresAt.HasValue && ExpiresAt <= DateTime.UtcNow)
        {
            Status = InvitationStatus.Expired;
            return Result.Failure("Invitation expired");
        }

        Status = InvitationStatus.Accepted;
        
        return Result.Success();
    }

    public Result Revoke()
    {
        if (Status != InvitationStatus.Pending)
            return Result.Failure("Invitation is not pending");
        
        Status = InvitationStatus.Revoked;
        
        return Result.Success();
    }
}