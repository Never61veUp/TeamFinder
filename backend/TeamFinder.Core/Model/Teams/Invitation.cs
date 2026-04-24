using CSharpFunctionalExtensions;

namespace TeamFinder.Core.Model.Teams;

public class Invitation : Entity<Guid>
{
    private Invitation(Guid id, Guid inviteeId, Guid invitedBy, DateTime? expiresAt = null) : base(id)
    {
        InviteeId = inviteeId;
        InvitedBy = invitedBy;
        Status = InvitationStatus.Pending;
        ExpiresAt = expiresAt;
    }

    public Guid InviteeId { get; }
    public Guid InvitedBy { get; private set; }
    public InvitationStatus Status { get; private set; }
    public DateTime? ExpiresAt { get; }

    public static Result<Invitation> Create(Guid id, Guid inviteeId, Guid invitedBy, DateTime? expiresAt = null)
    {
        if (expiresAt.HasValue && expiresAt <= DateTime.UtcNow)
            return Result.Failure<Invitation>("Invitation is expired");

        return new Invitation(id, inviteeId, invitedBy, expiresAt);
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