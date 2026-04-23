using CSharpFunctionalExtensions;
using Microsoft.EntityFrameworkCore;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Postgresql.Repositories;

public class SkillRepository : ISkillRepository
{
    private readonly AppDbContext _context;

    public SkillRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Result<SkillEntity>> GetSkillById(Guid skillId)
    {
        var skill = await _context.Skills.FindAsync(skillId);
        if (skill == null)
            return Result.Failure<SkillEntity>("Skill not found");

        return Result.Success(skill);
    }

    public async Task<List<Guid>> GetByParentId(Guid skillId)
    {
        return await _context.SkillClosures
            .Where(x => x.AncestorId == skillId)
            .Select(x => x.DescendantId)
            .ToListAsync();
    }

    public async Task<Result> AddRelation(Guid parentId, Guid childId, double weight = 1)
    {
        var parentAncestors = await _context.SkillClosures
            .Where(x => x.DescendantId == parentId)
            .ToListAsync();

        var childDescendants = await _context.SkillClosures
            .Where(x => x.AncestorId == childId)
            .ToListAsync();

        var relations = new List<SkillClosure>();

        foreach (var ancestor in parentAncestors)
        foreach (var descendant in childDescendants)
            relations.Add(new SkillClosure
            {
                AncestorId = ancestor.AncestorId,
                DescendantId = descendant.DescendantId,
                Depth = ancestor.Depth + descendant.Depth + 1
            });

        _context.SkillClosures.AddRange(relations);
        return await _context.SaveChangesAsync() > 0 ? Result.Success() : Result.Failure("Failed to add relation");
    }

    public async Task<Result> AddSkill(SkillEntity skillEntity)
    {
        var exists = await _context.Skills
            .AnyAsync(x => x.Name == skillEntity.Name);

        if (exists)
            return Result.Failure("Skill already exists");

        _context.Skills.Add(skillEntity);
        await _context.SaveChangesAsync();

        _context.SkillClosures.Add(new SkillClosure
        {
            AncestorId = skillEntity.Id,
            DescendantId = skillEntity.Id,
            Depth = 0
        });

        return await _context.SaveChangesAsync() > 0 ? Result.Success() : Result.Failure("Failed to add skill");
    }

    public async Task<Result<List<SkillEntity>>> GetAllParents(Guid skillId)
    {
        var parents = await _context.SkillClosures
            .Where(x => x.DescendantId == skillId && x.Depth > 0)
            .Select(x => x.Ancestor)
            .ToListAsync();

        if (parents.Count == 0)
            return Result.Failure<List<SkillEntity>>("No parents found");

        return Result.Success(parents);
    }

    public async Task<Result<List<SkillEntity>>> GetAllChildren(Guid skillId)
    {
        var children = await _context.SkillClosures
            .Where(x => x.AncestorId == skillId && x.Depth > 0)
            .Select(x => x.Descendant)
            .ToListAsync();

        if (children.Count == 0)
            return Result.Failure<List<SkillEntity>>("No children found");

        return Result.Success(children);
    }
}