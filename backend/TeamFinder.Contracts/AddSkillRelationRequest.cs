namespace TeamFinder.Contracts;

/// <param name="ParentId">Родительский навык</param>
/// <param name="ChildId">Дочерний навык</param>
public record AddSkillRelationRequest(Guid ParentId, Guid ChildId);