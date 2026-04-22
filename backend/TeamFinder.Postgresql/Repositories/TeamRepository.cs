using CSharpFunctionalExtensions;
using Microsoft.EntityFrameworkCore;
using TeamFinder.Core.Model.Teams;

namespace TeamFinder.Postgresql.Repositories;

public interface ITeamRepository
{
    Task<Result> SaveTeam(Team team);
    Task<Result<Team>> GetById(Guid id);
}

public class TeamRepository : ITeamRepository
{
    private readonly AppDbContext _context;

    public TeamRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Result> SaveTeam(Team team)
    {
        await _context.Teams.AddAsync(team);
        var result  = await _context.SaveChangesAsync();
        if (result > 0)
            return Result.Failure("Team not saved");
        return Result.Failure("Team saved");
    }

    public async Task<Result<Team>> GetById(Guid id)
    {
        var team = await _context.Teams.FirstOrDefaultAsync(i => i.Id == id);
        if (team == null)
            return Result.Failure<Team>("Team not found");
        return Result.Success(team);
    }
}