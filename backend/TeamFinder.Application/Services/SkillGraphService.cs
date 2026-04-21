using TeamFinder.Postgresql;

namespace TeamFinder.Application.Services;

public class SkillGraphService
{
    private readonly ISkillRelationRepository _repo;

    public SkillGraphService(ISkillRelationRepository repo)
    {
        _repo = repo;
    }

    public async Task<HashSet<Guid>> GetAllDescendants(Guid skillId)
    {
        var result = new HashSet<Guid>();
        var queue = new Queue<Guid>();

        queue.Enqueue(skillId);

        while (queue.Count > 0)
        {
            var current = queue.Dequeue();
            var children = await _repo.GetByParentId(current);

            foreach (var rel in children)
            {
                if (result.Add(rel.ChildSkillId))
                {
                    queue.Enqueue(rel.ChildSkillId);
                }
            }
        }

        return result;
    }
}