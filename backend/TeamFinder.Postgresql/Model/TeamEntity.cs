using System.ComponentModel.DataAnnotations.Schema;
using TeamFinder.Contracts;
using TeamFinder.Core.Model.Teams;

namespace TeamFinder.Postgresql.Model;

public class TeamEntity
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid OwnerId { get; set; }
    public int MaxMembers { get; set; }
    public TeamStatus Status { get; set; }
    public string? Description { get; set; } = string.Empty;
    
    public string? EventTitle { get; set; }
    public DateOnly? EventStart { get; set; }
    public DateOnly? EventEnd { get; set; }
    public List<Tag> EventTags { get; set; } = [];

    public List<TeamMemberEntity> Members { get; set; } = [];
    public List<WantedProfileEntity> WantedProfiles { get; set; } = [];
    public List<InvitationEntity> Invitations { get; set; } = [];
    public List<JoinRequestEntity> JoinRequests { get; set; } = [];
}