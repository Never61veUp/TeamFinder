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
        var existing = await _context.Teams
            .Include(t => t.Members)
            .Include(t => t.WantedProfiles).ThenInclude(w => w.RequiredSkills)
            .Include(t => t.Invitations)
            .FirstOrDefaultAsync(t => t.Id == team.Id);

        if (existing == null)
            await _context.Teams.AddAsync(team);
        else
        {
            existing.Name = team.Name;
            existing.OwnerId = team.OwnerId;
            existing.MaxMembers = team.MaxMembers;

            _context.TeamMembers.RemoveRange(_context.TeamMembers.Where(m => m.TeamId == existing.Id));
            var oldWanted = _context.WantedProfiles.Where(w => w.TeamId == existing.Id).Include(w => w.RequiredSkills)
                .ToList();
            _context.WantedProfileSkills.RemoveRange(oldWanted.SelectMany(w => w.RequiredSkills));
            _context.WantedProfiles.RemoveRange(oldWanted);
            _context.Invitations.RemoveRange(_context.Invitations.Where(i => i.TeamId == existing.Id));

            existing.Members = team.Members;
            existing.WantedProfiles = team.WantedProfiles;
            existing.Invitations = team.Invitations;

            _context.Teams.Update(existing);
        }

        var changes = await _context.SaveChangesAsync();
        return changes > 0 ? Result.Success() : Result.Failure("Team not saved");
    }

    public async Task<Result<TeamEntity>> GetById(Guid id)
    {
        var entity = await _context.Teams
            .Include(t => t.Members)
            .Include(t => t.WantedProfiles).ThenInclude(w => w.RequiredSkills)
            .Include(t => t.Invitations)
            .FirstOrDefaultAsync(t => t.Id == id && t.Status == TeamStatus.Active);

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

    public async Task<Result<IEnumerable<TeamEntity>>> GetAllTeams()
    {
        var teams = await _context.Teams
            .Include(t => t.Members)
            .Include(t => t.WantedProfiles).ThenInclude(w => w.RequiredSkills)
            .Include(t => t.Invitations)
            .Where(t => t.Status == TeamStatus.Active).ToListAsync();

        if(teams.Count == 0)
            return Result.Failure<IEnumerable<TeamEntity>>("No teams found");
        return Result.Success<IEnumerable<TeamEntity>>(teams);
    }
    
    public async Task<Result<TeamEntity>> GetByProfileId(Guid id)
    {
        var entity = await _context.Teams
            .Include(t => t.Members)
            .Include(t => t.WantedProfiles).ThenInclude(w => w.RequiredSkills)
            .Include(t => t.Invitations)
            .FirstOrDefaultAsync(t => 
                (t.OwnerId == id || t.Members.Any(m => m.ProfileId == id)) 
                && t.Status == TeamStatus.Active
            );

        if (entity == null)
            return Result.Failure<TeamEntity>("Team not found");

        return Result.Success(entity);
    }
    
    public async Task<Result> RemoveMember(Guid profileId)
    {
        var member = await _context.TeamMembers.FirstOrDefaultAsync(m => m.ProfileId == profileId);
        if (member == null)
            return Result.Failure("Team member not found");

        _context.TeamMembers.Remove(member);
        return await _context.SaveChangesAsync() > 0 
            ? Result.Success() 
            : Result.Failure("Failed to remove team member");
    }
    
    public async Task<Result> MakeInactive(Guid teamId)
    {
        var team = await _context.Teams.FindAsync(teamId);
        if (team == null) 
            return Result.Failure("Team not found");

        team.Status = TeamStatus.Inactive;

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
}