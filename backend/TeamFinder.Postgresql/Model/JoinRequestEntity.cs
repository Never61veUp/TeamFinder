using CSharpFunctionalExtensions;

namespace TeamFinder.Postgresql.Model;

public class JoinRequestEntity
{
    public Guid ProfileId { get; set; }
    public Guid TeamId { get; set; }
}