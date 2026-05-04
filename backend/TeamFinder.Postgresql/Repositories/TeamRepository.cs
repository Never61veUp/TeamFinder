using CSharpFunctionalExtensions;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using TeamFinder.Core.Model.Teams;
using TeamFinder.Postgresql.Abstractions;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Postgresql.Repositories;

public class TeamRepository : ITeamRepository
{
    private readonly AppDbContext _context;

    public TeamRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Result> SaveTeam(TeamEntity team)
    {
        await _context.Teams.AddAsync(team);

        var changes = await _context.SaveChangesAsync();
        return changes > 0 ? Result.Success() : Result.Failure("Team not saved");
    }

    public async Task<Result<TeamEntity>> GetById(Guid id, TeamStatus status = TeamStatus.Active)
    {
        var entity = await _context.Teams
            .Include(t => t.Members)
            .Include(t => t.WantedProfiles).ThenInclude(w => w.RequiredSkills)
            .Include(t => t.Invitations)
            .Include(t => t.JoinRequests)
            .FirstOrDefaultAsync(t => t.Id == id && t.Status == status);

        if (entity == null)
            return Result.Failure<TeamEntity>("Team not found");

        return Result.Success(entity);
    }

    public async Task<Result> AddInvitation(InvitationEntity invitationEntity)
    {
        await _context.Invitations.AddAsync(invitationEntity);
        
        try
        {
            await _context.SaveChangesAsync();
            return Result.Success();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException pg)
        {
            return pg.SqlState switch
            {
                PostgresErrorCodes.ForeignKeyViolation => Result.Failure("Team, Invitee or Inviter not found"),
                PostgresErrorCodes.UniqueViolation => Result.Failure("Invite already added"),
                PostgresErrorCodes.NotNullViolation => Result.Failure("Required data is missing"),
                _ => Result.Failure("Database error")
            };
        }
    }
    
    public async Task<Result> AddJoinRequest(Guid teamId, Guid profileId)
    {
        await _context.JoinRequests.AddAsync(new JoinRequestEntity
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
                PostgresErrorCodes.UniqueViolation => Result.Failure("JoinRequest already added"),
                PostgresErrorCodes.NotNullViolation => Result.Failure("Required data is missing"),
                _ => Result.Failure("Database error")
            };
        }
    }
    
    public async Task<Result> AcceptJoinRequest(Guid teamId, Guid profileId)
    {
        //TODO поискать применение транзакций в других местах
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            var deletedRows = await _context.JoinRequests
                .Where(jr => jr.TeamId == teamId && jr.ProfileId == profileId)
                .ExecuteDeleteAsync();
            if (deletedRows == 0)
            {
                await transaction.RollbackAsync();
                return Result.Failure("Join request not found");
            }

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
                PostgresErrorCodes.NotNullViolation => Result.Failure("Required data is missing"),
                _ => Result.Failure("Database error")
            };
        }
    }

    public async Task<Result<IEnumerable<TeamEntity>>> GetAllTeams(TeamStatus teamStatus)
    {
        var teams = await _context.Teams
            .AsNoTracking()
            .Include(t => t.Members)
            .Include(t => t.WantedProfiles).ThenInclude(w => w.RequiredSkills)
            .Include(t => t.Invitations)
            .Where(t => t.Status == teamStatus).ToListAsync();

        if(teams.Count == 0)
            return Result.Failure<IEnumerable<TeamEntity>>("No teams found");
        return Result.Success<IEnumerable<TeamEntity>>(teams);
    }
    
    public async Task<Result<TeamEntity>> GetByProfileId(Guid id, TeamStatus status = TeamStatus.Active)
    {
        var entity = await _context.Teams
            .Include(t => t.Members)
            .Include(t => t.WantedProfiles).ThenInclude(w => w.RequiredSkills)
            .Include(t => t.Invitations)
            .Include(t => t.JoinRequests)
            .FirstOrDefaultAsync(t => 
                (t.OwnerId == id || t.Members.Any(m => m.ProfileId == id)) 
                && t.Status == status
            );
        if (entity == null)
            return Result.Failure<TeamEntity>("Team not found");
        
        var statusResult = await UpdateStatus(entity, status);
        if (statusResult.IsFailure)
            return Result.Failure<TeamEntity>(statusResult.Error);

        return Result.Success(entity);
    }
    
    public async Task<Result<List<TeamEntity>>> GetTeamsByProfileId(Guid id, TeamStatus status = TeamStatus.Active)
    {
        var entity = await _context.Teams
            .Include(t => t.Members)
            .Include(t => t.WantedProfiles).ThenInclude(w => w.RequiredSkills)
            .Include(t => t.Invitations).OrderBy(t => t.EventEnd)
            .Where(t => 
                (t.OwnerId == id || t.Members.Any(m => m.ProfileId == id)) 
                && t.Status == status
            ).ToListAsync();

        if (entity.Count == 0)
            return Result.Failure<List<TeamEntity>>("Teams not found");

        return Result.Success(entity);
    }
    
    public async Task<Result> DeleteMemberByProfileId(Guid profileId)
    {
        return await _context.TeamMembers.Where(x => x.ProfileId == profileId).ExecuteDeleteAsync() > 0
            ? Result.Success() 
            : Result.Failure("Failed to remove team member");
    }
    
    public async Task<Result> MakeInactive(Guid teamId)
    {
        var team = await _context.Teams.FindAsync(teamId);
        if (team == null) 
            return Result.Failure("Team not found");

        team.Status = TeamStatus.Inactive;
        team.EventEnd = DateOnly.FromDateTime(DateTime.UtcNow);

        return await _context.SaveChangesAsync() > 0 
            ? Result.Success() 
            : Result.Failure("Failed to inactive team");
    }
    
    public async Task<Result> AddMember(Guid teamId, Guid profileId)
    {
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
    }

    private async Task<Result> UpdateStatus(TeamEntity entity, TeamStatus status)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        
        if (entity.Status == TeamStatus.Active && entity.EventEnd < today)
        {
            entity.Status = TeamStatus.Inactive;
            await _context.SaveChangesAsync();
            
            if (status == TeamStatus.Active)
                return Result.Failure<TeamEntity>("Team is now inactive due to expiration");
        }
        return  Result.Success();
    }
}