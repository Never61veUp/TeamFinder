using CSharpFunctionalExtensions;

namespace TeamFinder.Core.Model.Teams;

public class Team : Entity<Guid>
{
    private readonly List<Guid> _members = [];
    private readonly List<WantedProfile> _wantedProfiles = [];
    private readonly List<Guid> _joinRequests = [];
    private readonly List<Invitation> _invitations = [];
    public string Name { get; private set; }
    public Guid OwnerId { get; private set; }
    public IReadOnlyList<Guid> Members => _members.AsReadOnly();
    public int MaxMembers { get; private set; }
    public IReadOnlyList<WantedProfile> WantedProfiles => _wantedProfiles.AsReadOnly();
    public IReadOnlyList<Guid> JoinRequests => _joinRequests.AsReadOnly();
    public IReadOnlyList<Invitation> Invitations => _invitations.AsReadOnly();
    public bool IsFull() => _members.Count >= MaxMembers;
    
    private Team() { }
    
    public static Result<Team> Create(Guid ownerId, string name, int maxMembers, IEnumerable<WantedProfile>? wantedProfiles = null)
    {
        if (ownerId == Guid.Empty)
            return Result.Failure<Team>("OwnerId is required");
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure<Team>("Name is required");
        if (maxMembers <= 0)
            return Result.Failure<Team>("MaxMembers must be > 0");

        var team = new Team
        {
            Id = Guid.NewGuid(),
            OwnerId = ownerId,
            Name = name.Trim(),
            MaxMembers = maxMembers,
        };

        if (wantedProfiles != null)
            team._wantedProfiles.AddRange(wantedProfiles);

        team._members.Add(ownerId);

        return Result.Success(team);
    }
    
    public Result RequestToJoin(Guid profileId)
    {
        if (profileId == Guid.Empty)
            return Result.Failure("Invalid profile id");
        if (_members.Contains(profileId))
            return Result.Failure("Already a member");
        if (_joinRequests.Contains(profileId))
            return Result.Failure("Already requested");
        _joinRequests.Add(profileId);
        return Result.Success();
    }
    
    public Result AddMember(Guid profileId)
    {
        if (Members.Count >= MaxMembers)
            return Result.Failure("Team is full");
        if (Members.Any(x => x == profileId))
            return Result.Failure("Already in team");
        
        var request = JoinRequests.FirstOrDefault(x => x == profileId);

        if (!JoinRequests.Contains(profileId))
            return Result.Failure("User has not requested to join the team");

        _joinRequests.Remove(request);
        _members.Add(profileId);
        return Result.Success();
    }
    
    public Result<Guid> SendInvitation(Guid inviterId, Guid inviteeId, DateTime? expiresAt = null)
    {
        if (inviterId == Guid.Empty || inviteeId == Guid.Empty)
            return Result.Failure<Guid>("Invalid ids");

        if (!_members.Contains(inviterId))
            return Result.Failure<Guid>("Only team members can send invitations");

        if (_members.Contains(inviteeId))
            return Result.Failure<Guid>("User is already a member");

        if (IsFull())
            return Result.Failure<Guid>("Team is full");

        var invitation = new Invitation(inviteeId, inviterId, expiresAt);
        _invitations.Add(invitation);
        return Result.Success(invitation.Id);
    }
}

public class WantedProfile
{
    public List<Guid> RequiredSkills { get; private set; } = [];
    //TODO: Add more criteria like experience level, location, etc.
}


public class Invitation
{
    public Guid Id { get; private set; }
    public Guid InviteeId { get; private set; }
    public Guid InvitedBy { get; private set; }
    public InvitationStatus Status { get; private set; }
    
    private Invitation() { }

    public Invitation(Guid inviteeId, Guid invitedBy, DateTime? expiresAt = null)
    {
        Id = Guid.NewGuid();
        InviteeId = inviteeId;
        InvitedBy = invitedBy;
        Status = InvitationStatus.Pending;
    }

    public Result Accept()
    {
        if (Status != InvitationStatus.Pending)
            return Result.Failure("Invitation is not pending");
        Status = InvitationStatus.Accepted;
        return Result.Success();
    }

    public Result Revoke()
    {
        if (Status != InvitationStatus.Pending)
            return Result.Failure("Invitation is not pending");
        Status = InvitationStatus.Revoked;
        return Result.Success();
    }
}


public enum InvitationStatus
{
    Pending,
    Accepted,
    Revoked,
    Expired
}