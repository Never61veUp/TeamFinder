namespace TeamFinder.Postgresql.Model;

public class InvitationEntity
{
    public Guid Id { get; set; }
    public Guid TeamId { get; set; }
    public TeamEntity Team { get; set; } = null!;
    public Guid InviteeId { get; set; }
    public Guid InvitedBy { get; set; }
    public string Status { get; set; } = "Pending";
    public DateTime? ExpiresAt { get; set; }
}