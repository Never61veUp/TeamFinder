namespace TeamFinder.Contracts;

public record AddSkillRelationRequest(Guid ParentId, Guid ChildId);