namespace TeamFinder.Postgresql.Model;

public class TeamMemberEntity
{
    public Guid TeamId { get; set; }
    public TeamEntity Team { get; set; } = null!;
    public Guid ProfileId { get; set; }
}