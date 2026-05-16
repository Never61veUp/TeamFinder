using CSharpFunctionalExtensions;
using TeamFinder.Application.Abstractions;
using TeamFinder.Application.Mapping;
using TeamFinder.Contracts;
using TeamFinder.Core.Model.Teams;
using TeamFinder.Postgresql.Abstractions;
using TeamFinder.Postgresql.Repositories;

namespace TeamFinder.Application.Services;

public class TeamService : ITeamService
{
    private readonly ITeamRepository _teamRepository;
    private readonly INotificationService _notificationService;
    private readonly ITelegramNotificationTemplate _telegramNotificationTemplate;

    public TeamService(ITeamRepository teamRepository, IProfileRepository profileRepository, 
        INotificationService notificationService, ITelegramNotificationTemplate telegramNotificationTemplate)
    {
        _teamRepository = teamRepository;
        _notificationService = notificationService;
        _telegramNotificationTemplate = telegramNotificationTemplate;
    }

    public async Task<Result> CreateTeam(Guid ownerId, string name, int maxMembers, string? description, string? eventTitle, DateOnly? eventStart, DateOnly? eventEnd,
        List<Tag> eventTags)
    {
        var eventDetailsResult = EventDetails.Create(eventTitle, eventStart, eventEnd, eventTags);
        
        if (eventDetailsResult.IsFailure)
            return Result.Failure(eventDetailsResult.Error);
        
        return await Team.Create(ownerId, name, maxMembers, description, eventDetailsResult.Value)
            .Map(team => team.MapToEntity())
            .Bind(teamEntity => _teamRepository.SaveTeam(teamEntity));
    }

    public async Task<Result> InviteProfile(Guid teamId, Guid inviterId, Guid inviteeId)
    {
        var teamResult = await _teamRepository.GetById(teamId);
        if(teamResult.IsFailure)
            return teamResult;
        
        var result = await teamResult
            .Bind(entity => entity.MapToDomain())
            .Bind(team => team.SendInvitation(inviterId, inviteeId))
            .Map(invite => invite.MapToEntity())
            .Bind(invitationEntity => _teamRepository.AddInvitation(invitationEntity));

        if (result.IsSuccess)
        {
            var message = _telegramNotificationTemplate.CreateTeamInvitationMessage(teamResult.Value.Name,
                teamResult.Value.Members.FirstOrDefault(m => m.ProfileId == inviterId)?.Profile.UserName);
            await _notificationService.NotifyProfileAsync(
                inviteeId,
                message);
        }

        return result;
    }
    
    public async Task<Result> CreateJoinRequest(Guid teamId, Guid profileId)
    {
        var teamResult = await _teamRepository.GetById(teamId)
            .Bind(entity => entity.MapToDomain());
        if (teamResult.IsFailure)
            return teamResult;
        
        var requestResult = await teamResult.Value.RequestToJoin(profileId)
            .Bind(_ => _teamRepository.AddJoinRequest(teamId, profileId));

        if (requestResult.IsSuccess)
        {
            var message =
                _telegramNotificationTemplate.CreateNewJoinRequestMessage(teamResult.Value.Name);
            await _notificationService.NotifyProfileAsync(
                teamResult.Value.OwnerId,
                message);
        }

        return requestResult;
    }
    
    public async Task<Result> AcceptJoinRequest(Guid teamId, Guid profileId, Guid acceptInitiatorId)
    {
        var teamResult = await _teamRepository.GetById(teamId);
        if (teamResult.IsFailure)
            return teamResult;
        
        var acceptResult = await teamResult
            .Bind(entity => entity.MapToDomain())
            .Check(team => team.AcceptJoinRequest(profileId, acceptInitiatorId))
            .Bind(_ => _teamRepository.AcceptJoinRequest(teamId, profileId));

        if (acceptResult.IsSuccess)
        {
            var message = _telegramNotificationTemplate.CreateJoinRequestAcceptedMessage(teamResult.Value.Name);
            await _notificationService.NotifyProfileAsync(
                profileId,
                message,
                additionalUrl: "/create");
        }

        return acceptResult;
    }
    
    public async Task<Result<PagedResult<TeamsResponse>>> GetTeams(TeamStatus teamStatus, int from = 0, int count = 5)
    {
        var teamsCount = await _teamRepository.Count(teamStatus);
        var teams = await _teamRepository.GetAllTeams(teamStatus, from, count);
        if (teams.IsFailure)
            return Result.Failure<PagedResult<TeamsResponse>>(teams.Error);

        return new PagedResult<TeamsResponse>(teams.Value, teamsCount);
    }

    public async Task<Result<Team>> GetMyTeam(Guid profileId, TeamStatus status)
    {
        return await _teamRepository.GetByProfileId(profileId, status)
            .Bind(entity => entity.MapToDomain());
    }
    
    public async Task<Result<List<Team>>> GetMyTeamList(Guid profileId, TeamStatus status)
    {
        return await _teamRepository.GetTeamsByProfileId(profileId, status)
            .Bind(entity => entity.MapToDomainList(entity => entity.MapToDomain()));
    }
    
    public async Task<Result> LeaveTeam(Guid profileId)
    {
        return await _teamRepository.GetByProfileId(profileId)
            .Bind(entity => entity.MapToDomain())
            .Check(team => team.LeaveTeam(profileId))
            .Bind(_ => _teamRepository.LeaveTeamByProfileId(profileId));
    }
    
    public async Task<Result> MakeInactive(Guid profileId)
    {
        var teamResult = await _teamRepository.GetByProfileId(profileId)
            .Bind(entity => entity.MapToDomain());
        if (teamResult.IsFailure)
            return teamResult;

        var team = teamResult.Value;

        var inactiveResult = await team.MakeInactive(profileId)
            .Bind(teamId => _teamRepository.MakeInactive(teamId));
        if (inactiveResult.IsFailure) 
            return inactiveResult;

        var message = _telegramNotificationTemplate.CreateTeamDisbandedMessage(teamResult.Value.Name);
        var notifyTasks = team.Members
            .Where(x => x.Id != profileId)
            .Select(member =>
                _notificationService.NotifyProfileAsync(
                    member.Id,
                    message,
                    additionalUrl: "/profile")).ToList();

        await Task.WhenAll(notifyTasks);

        return inactiveResult;
    }
    
    public async Task<Result<Team>> GetTeamById(Guid teamId)
    {
        return await _teamRepository.GetById(teamId)
            .Bind(entity => entity.MapToDomain());
    }
    
    public async Task<Result> KickMember(Guid initiatorId, Guid profileId)
    {
        var teamResult = await _teamRepository.GetByProfileId(profileId);
        if(teamResult.IsFailure)
            return teamResult;
        
        var kickResult = await teamResult
            .Bind(entity => entity.MapToDomain())
            .Check(team => team.KickMember(initiatorId, profileId))
            .Bind(team => _teamRepository.MakeMemberInactive(profileId, team.Id));

        if (kickResult.IsSuccess)
        {
            var message = _telegramNotificationTemplate.CreateKickedFromTeamMessage(teamResult.Value.Name);
            await _notificationService.NotifyProfileAsync(
                profileId,
                message,
                additionalUrl: "/profile");
        }

        return kickResult;
    }
}