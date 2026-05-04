using CSharpFunctionalExtensions;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using TeamFinder.Contracts;
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

    public async Task<Result<IEnumerable<TeamsResponse>>> GetAllTeams(TeamStatus teamStatus, int from = 0, int count = 5)
    {
        var teams = await _context.Teams
            .AsNoTracking()
            .Where(t => t.Status == teamStatus)
            .OrderByDescending(t => t.EventEnd)
            .Skip(from)
            .Take(count)
            .Select(t => new 
            {
                Team = t,
                MemberIds = t.Members.Select(m => m.ProfileId).ToList(),
                AverageRating = t.Members.Select(m => (double?)m.Profile.Rating).Average()
            })
            .ToListAsync();
        
        var response = teams.Select(team => new TeamsResponse(
            team.Team.Name,
            team.Team.OwnerId,
            team.MemberIds,
            team.Team.MaxMembers,
            team.Team.Description ?? string.Empty,
            EventDetails.Create(team.Team.EventTitle ?? string.Empty,
                    team.Team.EventStart,
                    team.Team.EventEnd,
                    team.Team.EventTags).Value,
            (int)team.Team.Status,
            team.Team.Id,
            Math.Round(team.AverageRating ?? 0, 1)
        )).ToList();

        if(teams.Count == 0)
            return Result.Failure<IEnumerable<TeamsResponse>>("No teams found");
        return Result.Success<IEnumerable<TeamsResponse>>(response);
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
            .Include(t => t.Invitations)
            .Where(t => 
                (t.OwnerId == id || t.Members.Any(m => m.ProfileId == id)) 
                && t.Status == status
            ).OrderByDescending(t => t.EventEnd).ToListAsync();

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

    public async Task<int> Count(TeamStatus status =  TeamStatus.Active)
    {
        return await _context.Teams.CountAsync(t => t.Status == status);
    }
}