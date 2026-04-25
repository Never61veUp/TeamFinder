using CSharpFunctionalExtensions;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using TeamFinder.Postgresql.Abstractions;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Postgresql.Repositories;

public class ProfileRepository : IProfileRepository
{
    private readonly AppDbContext _context;

    public ProfileRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ProfileEntity?> GetById(Guid id)
    {
        return await _context.Profiles
            .Include(x => x.Skills).ThenInclude(us => us.Skill)
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<List<ProfileEntity>> GetAll()
    {
        return await _context.Profiles
            .Include(x => x.Skills)
            .ToListAsync();
    }

    public async Task<Result> Add(ProfileEntity profile)
    {
        await _context.Profiles.AddAsync(profile);
        
        return await _context.SaveChangesAsync() > 0 
            ? Result.Success() 
            : Result.Failure("Failed to add profile");
    }

    public async Task<Result> Update(ProfileEntity profile)
    {
        _context.Profiles.Update(profile);
        return await _context.SaveChangesAsync() > 0 ? Result.Success() : Result.Failure("Failed to update profile");
    }

    public async Task<List<ProfileEntity>> GetProfilesBySkillAsync(Guid ancestorSkillId)
    {
        var users = await _context.Profiles
            .Where(p => p.Skills.Any(s => s.SkillId == ancestorSkillId))
            .Include(x => x.Skills).ThenInclude(us => us.Skill)
            .ToListAsync();
        return users;
    }

    public async Task<Result> ConnectGithubInfo(Guid profileId, GithubEntity githubInfo)
    {
        var profile = await _context.Profiles.FindAsync(profileId);
        if (profile == null)
            return Result.Failure("Profile not found");

        profile.GithubInfo = githubInfo;
        _context.Profiles.Update(profile);
        return await _context.SaveChangesAsync() > 0
            ? Result.Success()
            : Result.Failure("Failed to connect Github info");
    }

    public async Task<Result<ProfileEntity>> GetByTgId(long tgId)
    {
        var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.TgId == tgId);
        if (profile == null)
            return Result.Failure<ProfileEntity>("Profile not found");
        return Result.Success(profile);
    }

    public async Task<ProfileEntity?> GetWithGithubStatsById(Guid id)
    {
        return await _context.Profiles
            .Include(x => x.GithubInfo)
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<Result> AddSkill(Guid profileId, Guid skillId)
    {
        await _context.ProfileSkillEntity.AddAsync(new ProfileSkillEntity
        {
            ProfileId = profileId,
            SkillId = skillId
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
                PostgresErrorCodes.ForeignKeyViolation => Result.Failure("Profile or skill not found"),
                PostgresErrorCodes.UniqueViolation => Result.Failure("Skill already added"),
                PostgresErrorCodes.NotNullViolation => Result.Failure("Required data is missing"),
                _ => Result.Failure("Database error")
            };
        }
    }
    
    public async Task<Result<List<ProfileEntity>>> FindBySkill(List<Guid> skillIds)
    {
        try
        {
            var profile = await _context.Profiles.AsNoTracking().Where(p => p.Skills.Any(s =>
                skillIds.Contains(s.SkillId))).Include(x => x.Skills)
                .ThenInclude(sk => sk.Skill).ToListAsync();
            
            return Result.Success(profile);
        }
        catch (Exception ex)
        {
            return Result.Failure<List<ProfileEntity>>(ex.Message);
        }
    }
    
    public async Task<Result> UpdateDescription(Guid profileId, string description)
    {
        try
        {
            var rowsChanged = await _context.Profiles.Where(p => p.Id == profileId)
                .ExecuteUpdateAsync(s => 
                    s.SetProperty(p => p.Description, description));
            
            return rowsChanged == 0 
                ? Result.Failure("Profile not found") 
                : Result.Success();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException pg)
        {
            return pg.SqlState switch
            {
                PostgresErrorCodes.NotNullViolation => Result.Failure("Description cannot be null"),
                _ => Result.Failure("Database error")
            };
        }
    }
}