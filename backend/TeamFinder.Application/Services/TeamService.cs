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
    private readonly IProfileRepository _profileRepository;
    private readonly ITelegramNotificationService _notificationService;

    public TeamService(ITeamRepository teamRepository, IProfileRepository profileRepository, ITelegramNotificationService notificationService)
    {
        _teamRepository = teamRepository;
        _profileRepository = profileRepository;
        _notificationService = notificationService;
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
        var result = await _teamRepository.GetById(teamId)
            .Bind(entity => entity.MapToDomain())
            .Bind(team => team.SendInvitation(inviterId, inviteeId))
            .Map(invite => invite.MapToEntity())
            .Bind(invitationEntity => _teamRepository.AddInvitation(invitationEntity));
        
        if (result.IsSuccess)
            await TryNotify(
                inviteeId,
                "Вам пришло новое приглашение в команду!");

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
            await TryNotify(
                teamResult.Value.OwnerId,
                "Вам пришла новая заявка в команду!");

        return requestResult;
    }
    
    public async Task<Result> AcceptJoinRequest(Guid teamId, Guid profileId, Guid acceptInitiatorId)
    {
        var acceptResult = await _teamRepository.GetById(teamId)
            .Bind(entity => entity.MapToDomain())
            .Check(team => team.AcceptJoinRequest(profileId, acceptInitiatorId))
            .Bind(_ => _teamRepository.AcceptJoinRequest(teamId, profileId));
        
        if (acceptResult.IsSuccess)
            await TryNotify(
                profileId,
                "Ваша заявка в команду была принята!");

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
        
        var notifyTasks = team.Members
            .Where(x => x.Id != profileId)
            .Select(member =>
                TryNotify(
                    member.Id,
                    "Команда была расформирована"));

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
        var kickResult = await _teamRepository.GetByProfileId(profileId)
            .Bind(entity => entity.MapToDomain())
            .Check(team => team.KickMember(initiatorId, profileId))
            .Bind(team => _teamRepository.MakeMemberInactive(profileId, team.Id));
        
        if (kickResult.IsSuccess)
            await TryNotify(
                profileId,
                "Вас исключили из команды!");

        return kickResult;
    }
    
    private async Task TryNotify(Guid profileId, string text)
    {
        var tgIdResult = await _profileRepository
            .GetTgIdByProfileId(profileId);

        if (tgIdResult.IsSuccess)
        {
            await _notificationService.SendTextNotificationAsync(
                tgIdResult.Value,
                text);
        }
    }
}