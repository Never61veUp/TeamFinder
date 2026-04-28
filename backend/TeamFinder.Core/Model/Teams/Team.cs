using System.Diagnostics.Tracing;
using CSharpFunctionalExtensions;

namespace TeamFinder.Core.Model.Teams;

public class Team : Entity<Guid>
{
    private readonly List<Invitation> _invitations = [];
    private readonly List<JoinRequest> _joinRequests = [];
    private readonly List<Guid> _members = [];
    private readonly List<WantedProfile> _wantedProfiles = [];

    private Team(Guid id, Guid ownerId, string name, int maxMembers, List<Guid> members, string description, EventDetails? eventDetails) : base(id)
    {
        Name = name;
        OwnerId = ownerId;
        MaxMembers = maxMembers;
        _members = members;
        Description = description;
        EventDetails = eventDetails;
    }

    public string Name { get; private set; }
    public Guid OwnerId { get; private set; }
    public IReadOnlyList<Guid> Members => _members.AsReadOnly();
    public int MaxMembers { get; }
    public string Description { get; private set; }
    public EventDetails? EventDetails { get; private set; }
    public TeamStatus Status { get; private set; }
    public IReadOnlyList<WantedProfile> WantedProfiles => _wantedProfiles.AsReadOnly();
    public IReadOnlyList<JoinRequest> JoinRequests => _joinRequests.AsReadOnly();
    public IReadOnlyList<Invitation> Invitations => _invitations.AsReadOnly();

    public bool IsFull() => _members.Count >= MaxMembers;
    
    public static Result<Team> Create(Guid ownerId, string name, int maxMembers, string? description, EventDetails? eventDetails)
    {
        if (ownerId == Guid.Empty)
            return Result.Failure<Team>("OwnerId is required");
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure<Team>("Name is required");
        if (maxMembers <= 0)
            return Result.Failure<Team>("MaxMembers must be > 0");

        var members = new List<Guid> { ownerId };

        var validDescription = description?.Trim() ?? string.Empty;

        var team = new Team(Guid.NewGuid(), ownerId, name, maxMembers, members, validDescription, eventDetails)
        {
            Status = TeamStatus.Active
        };

        return Result.Success(team);
    }
    
    public static Result<Team> Restore(Guid id, Guid ownerId, List<Guid> members, string name, int maxMembers, TeamStatus teamStatus, string? description,
        EventDetails? eventDetails,
        List<WantedProfile>? wantedProfiles = null, List<Invitation>? invitations = null,
        List<JoinRequest>? joinRequests = null)
    {
        //TODO: Доверяем бд?
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
        
        var validDescription = description?.Trim() ?? string.Empty;

        var team = new Team(id, ownerId, name, maxMembers, normalizedMembers, validDescription, eventDetails)
        {
            Status = teamStatus
        };

        if (wantedProfiles != null)
            team._wantedProfiles.AddRange(wantedProfiles);
        if (joinRequests != null)
            team._joinRequests.AddRange(joinRequests);
        if (invitations != null)
            team._invitations.AddRange(invitations);

        return Result.Success(team);
    }

    public Result<JoinRequest> RequestToJoin(Guid profileId)
    {
        if (profileId == Guid.Empty)
            return Result.Failure<JoinRequest>("Invalid profile id");
        if(Status == TeamStatus.Inactive)
            return Result.Failure<JoinRequest>("Team is inactive");
        if (_members.Contains(profileId))
            return Result.Failure<JoinRequest>("Already a member");
        if (_joinRequests.Any(r => r.ProfileId == profileId))
            return Result.Failure<JoinRequest>("Already requested");
        if (IsFull())
            return Result.Failure<JoinRequest>("Team is full");

        var joinRequest = new JoinRequest(Id, profileId);
        _joinRequests.Add(joinRequest);
        
        return Result.Success(joinRequest);
    }

    public Result AcceptInvitation(Guid profileId)
    {
        if (Members.Count >= MaxMembers)
            return Result.Failure("Team is full");
        if (_members.Contains(profileId))
            return Result.Failure("Already a member");
        if(_invitations.Any(i => i.InviteeId == profileId && i.Status != InvitationStatus.Pending))
            return Result.Failure("User has no pending invitation");
        
        _invitations.FirstOrDefault(i => i.InviteeId == profileId)?.Accept();
        _members.Add(profileId);
        
        return Result.Success();
    }

    public Result<Invitation> SendInvitation(Guid inviterId, Guid inviteeId, DateTime? expiresAt = null)
    {
        if (inviterId == Guid.Empty || inviteeId == Guid.Empty)
            return Result.Failure<Invitation>("Invalid ids");
        if(Status == TeamStatus.Inactive)
            return Result.Failure<Invitation>("Team is inactive");
        if (!_members.Contains(inviterId))
            return Result.Failure<Invitation>("Only team members can send invitations");
        if (_members.Contains(inviteeId))
            return Result.Failure<Invitation>("User is already a member");
        if (IsFull())
            return Result.Failure<Invitation>("Team is full");
        if (_invitations.Any(i => i.InviteeId == inviteeId && i.Status == InvitationStatus.Pending))
            return Result.Failure<Invitation>("Invitation already sent");
        if (_joinRequests.Any(request => request.ProfileId == inviteeId))
            return Result.Failure<Invitation>("User already requested to join");

        var invitation = Invitation.Create(inviteeId, inviterId, Id, expiresAt);
        if (invitation.IsFailure)
            return Result.Failure<Invitation>(invitation.Error);
        
        _invitations.Add(invitation.Value);
        
        return Result.Success(invitation.Value);
    }

    public Result AcceptJoinRequest(Guid profileId, Guid acceptInitiatorId)
    {
        if (IsFull())
            return Result.Failure("Team is full");
        if(Status == TeamStatus.Inactive)
            return Result.Failure("Team is inactive");
        if(acceptInitiatorId != OwnerId)
            return Result.Failure("Only team owner can accept join requests");
        
        var request = _joinRequests.FirstOrDefault(r => r.ProfileId == profileId);
        if (request == null)
            return Result.Failure("Join request not found");
        
        if (_members.Contains(profileId))
        {
            _joinRequests.Remove(request);
            return Result.Failure("User is already a member");
        }
        
        _members.Add(profileId);
        _joinRequests.Remove(request);
        
        return Result.Success();
    }
    
    public Result LeaveTeam(Guid profileId)
    {
        if (!_members.Contains(profileId))
            return Result.Failure("Not a team member");
        if (profileId == OwnerId)
            return Result.Failure("Only team member can leave team");
        if(Status == TeamStatus.Inactive)
            return Result.Failure("Team is inactive");
        
        _members.Remove(profileId);
        return Result.Success();
    }

    public Result<Guid> MakeInactive(Guid initiatorId)
    {
        if (initiatorId != OwnerId)
            return Result.Failure<Guid>("Only team owner can disband the team");
        if(Status == TeamStatus.Inactive)
            return Result.Failure<Guid>("Team is already inactive");
        
        Status = TeamStatus.Inactive;
        return Result.Success(Id);
    }
}

public enum TeamStatus
{
    Active = 1,
    Inactive = 0
}