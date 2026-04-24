using CSharpFunctionalExtensions;
using Microsoft.EntityFrameworkCore;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Postgresql.Repositories;

public interface ITeamRepository
{
    Task<Result> SaveTeam(TeamEntity team);
    Task<Result<TeamEntity>> GetById(Guid id);
    Task<Result> UpdateTeam(TeamEntity team);
}

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
            .FirstOrDefaultAsync(t => t.Id == id);

        if (entity == null)
            return Result.Failure<TeamEntity>("Team not found");

        return Result.Success(entity);
    }

    public async Task<Result> UpdateTeam(TeamEntity team)
    {
        await _context.Invitations.AddRangeAsync(team.Invitations);
        return await _context.SaveChangesAsync() > 0 ? Result.Success() : Result.Failure("Failed to update profile");
    }

    public async Task<Result> AddInvitation(TeamEntity team)
    {
        await _context.Invitations.AddRangeAsync(team.Invitations);
        return await _context.SaveChangesAsync() > 0 ? Result.Success() : Result.Failure("Failed to update profile");
    }
}