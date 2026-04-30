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
        var skill = await _context.Skills
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == skillId);
            
        return skill == null 
            ? Result.Failure<SkillEntity>("Skill not found") 
            : Result.Success(skill);
    }

    public async Task<List<Guid>> GetByParentId(Guid skillId)
    {
        return await _context.SkillClosures
            .Where(x => x.AncestorId == skillId)
            .AsNoTracking()
            .Select(x => x.DescendantId)
            .ToListAsync();
    }

    public async Task<Result> AddRelation(Guid parentId, Guid childId, double weight = 1)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();
        try 
        {
            var parentAncestors = await _context.SkillClosures
                .Where(x => x.DescendantId == parentId)
                .ToListAsync();

            var childDescendants = await _context.SkillClosures
                .Where(x => x.AncestorId == childId)
                .ToListAsync();

            var relations = new List<SkillClosure>();

            foreach (var ancestor in parentAncestors)
            {
                foreach (var descendant in childDescendants)
                {
                    var alreadyExists = await _context.SkillClosures.AnyAsync(sc => 
                        sc.AncestorId == ancestor.AncestorId && 
                        sc.DescendantId == descendant.DescendantId);

                    if (!alreadyExists)
                    {
                        relations.Add(new SkillClosure
                        {
                            AncestorId = ancestor.AncestorId,
                            DescendantId = descendant.DescendantId,
                            Depth = ancestor.Depth + descendant.Depth + 1
                        });
                    }
                }
            }

            if (relations.Count != 0)
            {
                _context.SkillClosures.AddRange(relations);
                await _context.SaveChangesAsync();
            }

            await transaction.CommitAsync();
            return Result.Success();
        }
        catch (Exception)
        {
            await transaction.RollbackAsync();
            return Result.Failure("Failed to add relation");
        }
    }

    public async Task<Result> AddSkill(SkillEntity skillEntity)
    {
        var exists = await _context.Skills.AnyAsync(x => x.Name == skillEntity.Name);
        if (exists)
            return Result.Failure("Skill already exists");

        _context.Skills.Add(skillEntity);
        _context.SkillClosures.Add(new SkillClosure
        {
            AncestorId = skillEntity.Id,
            DescendantId = skillEntity.Id,
            Depth = 0
        });

        return await _context.SaveChangesAsync() > 0 
            ? Result.Success() 
            : Result.Failure("Failed to save skill");
    }

    public async Task<Result<List<SkillEntity>>> GetAllParents(Guid skillId)
    {
        var parents = await _context.SkillClosures
            .Where(x => x.DescendantId == skillId && x.Depth > 0)
            .Select(x => x.Ancestor)
            .OrderBy(x => x.Name)
            .AsNoTracking()
            .ToListAsync();

        return Result.Success(parents);
    }

    public async Task<Result<List<SkillEntity>>> GetAllChildren(Guid skillId)
    {
        var children = await _context.SkillClosures
            .Where(x => x.AncestorId == skillId && x.Depth > 0)
            .Select(x => x.Descendant)
            .OrderBy(x => x.Name)
            .AsNoTracking()
            .ToListAsync();
        
        return Result.Success(children);
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
        return await _context.Skills
            .AsNoTracking().OrderBy(n => n.Name)
            .ToListAsync();
    }
}