using CSharpFunctionalExtensions;

namespace TeamFinder.Core.Model.Teams;

public class Team : Entity<Guid>
{
    private readonly List<Invitation> _invitations = [];
    private readonly List<Guid> _joinRequests = [];
    private readonly List<Guid> _members;
    private readonly List<WantedProfile> _wantedProfiles = [];

    private Team(Guid id, Guid ownerId, string name, List<Guid> members, int maxMembers) : base(id)
    {
        Name = name;
        OwnerId = ownerId;
        _members = members;
        MaxMembers = maxMembers;
    }

    public string Name { get; private set; }
    public Guid OwnerId { get; private set; }
    public IReadOnlyList<Guid> Members => _members.AsReadOnly();
    public int MaxMembers { get; }
    public IReadOnlyList<WantedProfile> WantedProfiles => _wantedProfiles.AsReadOnly();
    public IReadOnlyList<Guid> JoinRequests => _joinRequests.AsReadOnly();
    public IReadOnlyList<Invitation> Invitations => _invitations.AsReadOnly();

    public bool IsFull() => _members.Count >= MaxMembers;

    public static Result<Team> Create(Guid id, Guid ownerId, List<Guid> members, string name, int maxMembers,
        List<WantedProfile>? wantedProfiles = null, List<Invitation>? invitations = null,
        List<Guid>? joinRequests = null)
    {
        if (ownerId == Guid.Empty)
            return Result.Failure<Team>("OwnerId is required");
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure<Team>("Name is required");
        if (maxMembers <= 0)
            return Result.Failure<Team>("MaxMembers must be > 0");
        if (members.Count > maxMembers)
            return Result.Failure<Team>("Members exceed maxMembers");

        var normalizedMembers = members.Distinct().ToList();

        if (!normalizedMembers.Contains(ownerId))
            normalizedMembers.Add(ownerId);

        var team = new Team(id, ownerId, name, normalizedMembers, maxMembers);

        if (wantedProfiles != null)
            team._wantedProfiles.AddRange(wantedProfiles);
        if (joinRequests != null)
            team._joinRequests.AddRange(joinRequests);
        if (invitations != null)
            team._invitations.AddRange(invitations);

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
        if (IsFull())
            return Result.Failure("Team is full");

        _joinRequests.Add(profileId);
        
        return Result.Success();
    }

    public Result AddMember(Guid profileId)
    {
        if (Members.Count >= MaxMembers)
            return Result.Failure("Team is full");
        if (_members.Contains(profileId))
            return Result.Failure("Already a member");
        if (!_joinRequests.Remove(profileId))
            return Result.Failure("User has not requested to join the team");

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
        if (_invitations.Any(i => i.InviteeId == inviteeId && i.Status == InvitationStatus.Pending))
            return Result.Failure<Guid>("Invitation already sent");
        if (_joinRequests.Contains(inviteeId))
            return Result.Failure<Guid>("User already requested to join");

        var invitation = Invitation.Create(Guid.NewGuid(), inviteeId, inviterId, expiresAt);
        if (invitation.IsFailure)
            return Result.Failure<Guid>(invitation.Error);
        
        _invitations.Add(invitation.Value);
        
        return Result.Success(invitation.Value.Id);
    }

    public Result AcceptInvitation(Guid invitationId)
    {
        var invitation = _invitations.FirstOrDefault(i => i.Id == invitationId);
        if (invitation == null)
            return Result.Failure("Invitation not found");
        
        if (IsFull())
            return Result.Failure("Team is full");
        
        var acceptResult = invitation.Accept();
        if (acceptResult.IsFailure)
            return acceptResult;
        
        _members.Add(invitation.InviteeId);
        _joinRequests.Remove(invitation.InviteeId);
        
        return Result.Success();
    }
}

public class WantedProfile : Entity<Guid>
{
    private readonly List<Guid> _requiredSkills;

    private WantedProfile(Guid id, List<Guid> requiredSkills) : base(id)
    {
        _requiredSkills = requiredSkills.Distinct().ToList();
    }

    public IReadOnlyList<Guid> RequiredSkills => _requiredSkills.AsReadOnly();

    public static Result<WantedProfile> Create(Guid id, List<Guid> requiredSkills)
    {
        if (requiredSkills.Count == 0)
            return Result.Failure<WantedProfile>("Required skills must be > 0");
        
        return new WantedProfile(id, requiredSkills);
    }

    public Result AddSkill(Guid skillId)
    {
        if (_requiredSkills.Contains(skillId))
            return Result.Failure<Guid>("Skill already exists");
        
        _requiredSkills.Add(skillId);
        
        return Result.Success(skillId);
    }
    //TODO: Add more criteria like experience level, location, etc.
}

public class Invitation : Entity<Guid>
{
    private Invitation(Guid id, Guid inviteeId, Guid invitedBy, DateTime? expiresAt = null) : base(id)
    {
        InviteeId = inviteeId;
        InvitedBy = invitedBy;
        Status = InvitationStatus.Pending;
        ExpiresAt = expiresAt;
    }

    public Guid InviteeId { get; }
    public Guid InvitedBy { get; private set; }
    public InvitationStatus Status { get; private set; }
    public DateTime? ExpiresAt { get; }

    public static Result<Invitation> Create(Guid id, Guid inviteeId, Guid invitedBy, DateTime? expiresAt = null)
    {
        if (expiresAt.HasValue && expiresAt <= DateTime.UtcNow)
            return Result.Failure<Invitation>("Invitation is expired");

        return new Invitation(id, inviteeId, invitedBy, expiresAt);
    }

    public Result Accept()
    {
        if (Status != InvitationStatus.Pending)
            return Result.Failure("Invitation is not pending");
        
        if (ExpiresAt.HasValue && ExpiresAt <= DateTime.UtcNow)
        {
            Status = InvitationStatus.Expired;
            return Result.Failure("Invitation expired");
        }

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