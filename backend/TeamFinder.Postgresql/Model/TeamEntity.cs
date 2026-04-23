namespace TeamFinder.Postgresql.Model;

public class TeamEntity
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid OwnerId { get; set; }
    public int MaxMembers { get; set; }

    public List<TeamMemberEntity> Members { get; set; } = new();
    public List<WantedProfileEntity> WantedProfiles { get; set; } = new();
    public List<InvitationEntity> Invitations { get; set; } = new();
}