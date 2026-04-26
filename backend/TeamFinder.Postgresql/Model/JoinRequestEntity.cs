using CSharpFunctionalExtensions;

namespace TeamFinder.Postgresql.Model;

public class JoinRequestEntity : Entity<Guid>
{
    public Guid ProfileId { get; set; }
    public Guid TeamId { get; set; }
}