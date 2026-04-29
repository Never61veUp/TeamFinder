using CSharpFunctionalExtensions;
using Microsoft.EntityFrameworkCore;
using TeamFinder.Core.Model.Teams;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Postgresql.Repositories;

public interface IInvitationRepository
{
    Task<Result<IEnumerable<InvitationEntity>>> GetInvitationsByInviteeProfileId(Guid inviteeId, InvitationStatus status = InvitationStatus.Pending);
    Task<Result> AcceptInvitation(Guid invitationId);
    Task<Result<InvitationEntity>> GetInvitationById(Guid invitationId);
}

public class InvitationRepository : IInvitationRepository
{
    private readonly AppDbContext _context;

    public InvitationRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IEnumerable<InvitationEntity>>> GetInvitationsByInviteeProfileId(Guid inviteeId, InvitationStatus status = InvitationStatus.Pending)
    {
        var invitation = await _context.Invitations
            .Where(i => i.InviteeId == inviteeId && i.Status == status)
            .AsNoTracking().ToListAsync();
        if(invitation.Count == 0)
            return Result.Failure<IEnumerable<InvitationEntity>>("No invitations found");
        return  Result.Success<IEnumerable<InvitationEntity>>(invitation);
    }
    
    public async Task<Result> AcceptInvitation(Guid invitationId)
    {
        var acceptResult = await _context.Invitations.Where(i => i.Id == invitationId)
                .ExecuteUpdateAsync(invitation => invitation
                    .SetProperty(i => i.Status, InvitationStatus.Accepted));
        
        if(acceptResult == 0)
            return Result.Failure("No invitations found");
        return  Result.Success();
    }

    public async Task<Result<InvitationEntity>> GetInvitationById(Guid invitationId)
    {
        var invitation = await _context.Invitations.FirstOrDefaultAsync(i => i.Id == invitationId);
        if (invitation == null)
            return Result.Failure<InvitationEntity>("Invitation not found");
        return Result.Success(invitation);
    }
}