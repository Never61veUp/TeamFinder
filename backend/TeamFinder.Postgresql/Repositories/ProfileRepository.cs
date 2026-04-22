using CSharpFunctionalExtensions;
using Microsoft.EntityFrameworkCore;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Postgresql.Repositories;

public interface IProfileRepository
{
    Task<ProfileEntity?> GetById(Guid id);
    Task<List<ProfileEntity>> GetAll();
    Task Add(ProfileEntity profile);
    Task<List<ProfileEntity>> GetProfilesBySkillAsync(Guid ancestorSkillId);
    Task<Result> Update(ProfileEntity profile);
    Task<Result> ConnectGithubInfo(Guid profileId, GithubEntity githubInfo);
    Task<Result<ProfileEntity>> GetByTgId(long tgId);
}

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

    public async Task Add(ProfileEntity profile)
    {
        await _context.Profiles.AddAsync(profile);
        await _context.SaveChangesAsync();
    }
    
    public async Task<Result> Update(ProfileEntity profile)
    {
        _context.Profiles.Update(profile);
        return await _context.SaveChangesAsync() > 0 ? Result.Success() : Result.Failure("Failed to update profile");
    }
    
    public async Task<List<ProfileEntity>> GetProfilesBySkillAsync(Guid ancestorSkillId)
    {
        var query =
            from p in _context.Profiles
            join ps in _context.ProfileSkillEntity on p.Id equals ps.ProfileId
            join sc in _context.SkillClosures on ps.SkillId equals sc.DescendantId
            where sc.AncestorId == ancestorSkillId
            select p;

        var test = await _context.SkillClosures
            .Where(x => x.AncestorId == ancestorSkillId)
            .ToListAsync();
        
        var users = await query
            .Distinct()
            .Include(p => p.Skills)
            .ThenInclude(s => s.Skill)
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
        return await _context.SaveChangesAsync() > 0 ? Result.Success() : Result.Failure("Failed to connect Github info");
    }
    
    public async Task<Result<ProfileEntity>> GetByTgId(long tgId)
    {
        var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.TgId == tgId);
        if (profile == null)
            return Result.Failure<ProfileEntity>("Profile not found");
        return Result.Success(profile);
    }
}