using CSharpFunctionalExtensions;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using TeamFinder.Core.Model.Teams;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Postgresql.Repositories;

public interface IInvitationRepository
{
    Task<Result<IEnumerable<InvitationEntity>>> GetInvitationsByInviteeProfileId(Guid inviteeId, InvitationStatus status = InvitationStatus.Pending);
    Task<Result> AcceptInvitationAndAddMember(Guid invitationId, Guid teamId, Guid profileId);
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
    
    public async Task<Result> AcceptInvitationAndAddMember(Guid invitationId, Guid teamId, Guid profileId)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var acceptResult = await _context.Invitations
                .Where(i => i.Id == invitationId && i.Status == InvitationStatus.Pending)
                .ExecuteUpdateAsync(invitation => invitation
                    .SetProperty(i => i.Status, InvitationStatus.Accepted));

            if (acceptResult == 0)
                return Result.Failure("Invitation not found or already processed");
            
            await _context.TeamMembers.AddAsync(new TeamMemberEntity
            {
                TeamId = teamId,
                ProfileId = profileId
            });

            await _context.SaveChangesAsync();
            
            await transaction.CommitAsync();
        
            return Result.Success();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException pg)
        {
            return pg.SqlState switch
            {
                PostgresErrorCodes.ForeignKeyViolation => Result.Failure("Team or Profile not found"),
                PostgresErrorCodes.UniqueViolation => Result.Failure("User is already a team member"),
                _ => Result.Failure($"Database error")
            };
        }
        catch (Exception)
        {
            return Result.Failure("An unexpected error occurred");
        }
    }

    public async Task<Result<InvitationEntity>> GetInvitationById(Guid invitationId)
    {
        var invitation = await _context.Invitations.FirstOrDefaultAsync(i => i.Id == invitationId);
        if (invitation == null)
            return Result.Failure<InvitationEntity>("Invitation not found");
        return Result.Success(invitation);
    }
}