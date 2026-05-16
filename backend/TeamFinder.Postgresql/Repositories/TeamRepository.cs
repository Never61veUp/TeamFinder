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
        var isAlreadyInTeam = await _context.Teams.AnyAsync(t => 
            t.Status == TeamStatus.Active && t.Members.Any(m => m.ProfileId == team.OwnerId && m.Status == MemberStatus.Active));
        
        if (isAlreadyInTeam)
            return Result.Failure("That user is already in a team");
        
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
                ProfileId = profileId,
                Status = MemberStatus.Active
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
        await UpdateStatusesIfExpired();
        var query = _context.Teams
            .AsNoTracking()
            .Where(t => t.Status == teamStatus);
        
        var teamData = await query
            .Select(t => new 
            {
                t.Id,
                t.Name,
                t.OwnerId,
                t.MaxMembers,
                t.Description,
                t.EventTitle,
                t.EventStart,
                t.EventEnd,
                t.EventTags,
                t.Status,
                MemberIds = t.Members.Select(m => new Member(m.ProfileId, m.Status)).ToList(),
                AverageRating = 
                    t.Members.Where(m => m.Profile.Rating > 0)
                        .Average(m => (double?)m.Profile.Rating) ?? 0
            })
            .OrderByDescending(t => t.AverageRating)
            .Skip(from)
            .Take(count)
            .ToListAsync();

        if (teamData.Count == 0)
            return Result.Failure<IEnumerable<TeamsResponse>>("No teams found");
        
        var response = teamData.Select(t => new TeamsResponse(
            t.Name,
            t.OwnerId,
            t.MemberIds,
            t.MaxMembers,
            t.Description ?? string.Empty,
            EventDetails.Create(
                t.EventTitle ?? string.Empty,
                t.EventStart,
                t.EventEnd,
                t.EventTags).Value,
            (int)t.Status,
            t.Id,
            Math.Round(t.AverageRating, 1)
        ));

        return Result.Success(response);
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
        
        var oldStatus = entity.Status;
        ChangeStatusIfExpired(entity);
        
        if (oldStatus != entity.Status)
            await _context.SaveChangesAsync();

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
    
    public async Task<Result> LeaveTeamByProfileId(Guid profileId)
    {
        return await _context.TeamMembers.Where(x => x.ProfileId == profileId)
            .ExecuteUpdateAsync(s => s
                .SetProperty(m => m.Status, MemberStatus.Inactive)) > 0
            ? Result.Success() 
            : Result.Failure("Failed to leave team");
    }
    
    public async Task<Result> MakeInactive(Guid teamId)
    {
        await _context.TeamMembers
            .Where(m => m.TeamId == teamId)
            .ExecuteUpdateAsync(s => s
                .SetProperty(m => m.Status, MemberStatus.Inactive));
        
        var updatedRows = await _context.Teams
            .Where(t => t.Id == teamId)
            .ExecuteUpdateAsync(s => s
                .SetProperty(t => t.Status, TeamStatus.Inactive)
                .SetProperty(t => t.EventEnd, DateOnly.FromDateTime(DateTime.UtcNow)));
        
        return updatedRows > 0 
            ? Result.Success() 
            : Result.Failure("Team not found");
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

    public async Task<Result> MakeMemberInactive(Guid profileId, Guid teamId)
    {
        return await _context.TeamMembers
            .Where(t => t.ProfileId == profileId && t.TeamId == teamId)
            .ExecuteUpdateAsync(s => s
                .SetProperty(t => t.Status, MemberStatus.Inactive)) > 0
            ? Result.Success()
            : Result.Failure("Failed to update member");
    }

    public async Task<int> Count(TeamStatus status =  TeamStatus.Active)
    {
        return await _context.Teams.CountAsync(t => t.Status == status);
    }
    
    private async Task UpdateStatusesIfExpired()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        
        await _context.Teams
            .Where(t => t.Status == TeamStatus.Active && t.EventEnd < today)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.Status, TeamStatus.Inactive));
    }
    
    private void ChangeStatusIfExpired(TeamEntity entity)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
    
        if (entity.Status == TeamStatus.Active && entity.EventEnd < today)
            entity.Status = TeamStatus.Inactive;
    }
}