using CSharpFunctionalExtensions;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using TeamFinder.Core.Model.Teams;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Postgresql.Repositories;

public interface IInvitationRepository
{
    Task<Result<IEnumerable<InvitationEntity>>> GetInvitationsByInviteeProfileId(Guid inviteeId, InvitationStatus status = InvitationStatus.Pending);
    Task<Result> AcceptInvitation(Guid invitationId, Guid teamId, Guid profileId);
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
    
    public async Task<Result> AcceptInvitation(Guid invitationId, Guid teamId, Guid profileId)
    {
        //TODO: использовать транзакции
        
        var acceptResult = await _context.Invitations.Where(i => i.Id == invitationId)
                .ExecuteUpdateAsync(invitation => invitation
                    .SetProperty(i => i.Status, InvitationStatus.Accepted));
        
        if(acceptResult == 0)
            return Result.Failure("No invitations found");
        
        await _context.TeamMembers.AddAsync(new TeamMemberEntity
        {
            TeamId = teamId,
            ProfileId = profileId
        });
        
        try
        {
            await _context.SaveChangesAsync();
            return Result.Success();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException pg)
        {
            return pg.SqlState switch
            {
                PostgresErrorCodes.ForeignKeyViolation => Result.Failure("Team or Profile not found"),
                PostgresErrorCodes.UniqueViolation => Result.Failure("User is already a team member"),
                PostgresErrorCodes.NotNullViolation => Result.Failure("Required data is missing"),
                _ => Result.Failure("Database error")
            };
        }
        
        
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