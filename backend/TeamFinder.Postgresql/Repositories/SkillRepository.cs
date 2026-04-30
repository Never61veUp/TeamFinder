using CSharpFunctionalExtensions;
using Microsoft.EntityFrameworkCore;
using TeamFinder.Postgresql.Abstractions;
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
        try
        {
            var parents = await _context.SkillClosures
                .Where(x => x.DescendantId == skillId && x.Depth > 0)
                .Select(x => x.Ancestor)
                .AsNoTracking()
                .ToListAsync();

            return Result.Success(parents);
        }
        catch (Exception e)
        {
            return Result.Failure<List<SkillEntity>>("Failed to get parents");
        }
    }

    public async Task<Result<List<SkillEntity>>> GetAllChildren(Guid skillId)
    {
        try
        {
            var children = await _context.SkillClosures
                .Where(x => x.AncestorId == skillId && x.Depth > 0)
                .Select(x => x.Descendant)
                .AsNoTracking()
                .ToListAsync();
            
            return Result.Success(children);
        }
        catch (Exception e)
        {
            return Result.Failure<List<SkillEntity>>("Failed to get children");
        }
    }
    public async Task<List<string>> GetSkillTreeDev()
    {
        var paths = await _context.Database
            .SqlQuery<string>($"""
                                   WITH RECURSIVE tree AS (
                                       SELECT
                                           s."Id",
                                           s."Name",
                                           s."Id" as root_id,
                                           s."Name"::text as path
                                       FROM skills s
                                       WHERE NOT EXISTS (
                                           SELECT 1
                                           FROM skill_closure sc
                                           WHERE sc."DescendantId" = s."Id"
                                             AND sc."Depth" = 1
                                       )

                                       UNION ALL

                                       SELECT
                                           child."Id",
                                           child."Name",
                                           t.root_id,
                                           t.path || ' -> ' || child."Name"
                                       FROM tree t
                                       JOIN skill_closure sc
                                           ON sc."AncestorId" = t."Id" AND sc."Depth" = 1
                                       JOIN skills child
                                           ON child."Id" = sc."DescendantId"
                                   )
                                   SELECT path FROM tree;
                               """)
            .ToListAsync();
        return paths;
    }

    public async Task<Result<List<SkillEntity>>> GetAllSkills()
    {
        return await _context.Skills.AsNoTracking().ToListAsync();
    }
}