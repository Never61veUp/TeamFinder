using CSharpFunctionalExtensions;
using Microsoft.EntityFrameworkCore;
using TeamFinder.Core.Model.Teams;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Postgresql.Repositories;

public interface IInvitationRepository
{
    Task<Result<IEnumerable<InvitationEntity>>> GetInvitationsByInviteeProfileId(Guid inviteeId, InvitationStatus status = InvitationStatus.Pending);
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
}