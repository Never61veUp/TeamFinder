using CSharpFunctionalExtensions;

namespace TeamFinder.Core.Model.Teams;

public class JoinRequest : ValueObject<JoinRequest>
{
    public Guid TeamId { get; private set; }
    public Guid ProfileId { get; private set; }
    public DateTime RequestedAt { get; private set; }

    public JoinRequest(Guid teamId, Guid profileId)
    {
        TeamId = teamId;
        ProfileId = profileId;
        RequestedAt = DateTime.UtcNow;
    }

    protected override bool EqualsCore(JoinRequest other)
    {
        return TeamId == other.TeamId &&
               ProfileId == other.ProfileId &&
               RequestedAt == other.RequestedAt;
    }

    protected override int GetHashCodeCore()
    {
        return HashCode.Combine(TeamId, ProfileId, RequestedAt);
    }
}