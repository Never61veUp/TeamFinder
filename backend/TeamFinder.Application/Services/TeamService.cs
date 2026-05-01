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
    private readonly ITeamRepository _repository;

    public TeamService(ITeamRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result> CreateTeam(Guid ownerId, string name, int maxMembers, string? description, string? eventTitle, DateOnly? eventStart, DateOnly? eventEnd,
        List<Tag> eventTags)
    {
        var eventDetailsResult = EventDetails.Create(eventTitle, eventStart, eventEnd, eventTags);
        
        if (eventDetailsResult.IsFailure)
            return Result.Failure(eventDetailsResult.Error);
        
        return await Team.Create(ownerId, name, maxMembers, description, eventDetailsResult.Value)
            .Map(team => team.MapToEntity())
            .Bind(teamEntity => _repository.SaveTeam(teamEntity));
    }

    public async Task<Result> InviteProfile(Guid teamId, Guid inviterId, Guid inviteeId)
    {
        return await _repository.GetById(teamId)
            .Bind(entity => entity.MapToDomain())
            .Bind(team => team.SendInvitation(inviterId, inviteeId))
            .Map(invite => invite.MapToEntity())
            .Bind(entity => _repository.AddInvitation(entity));
    }
    
    public async Task<Result> CreateJoinRequest(Guid teamId, Guid profileId)
    {
        return await _repository.GetById(teamId)
            .Bind(entity => entity.MapToDomain())
            .Check(team => team.RequestToJoin(profileId))
            .Bind(_ => _repository.AddJoinRequest(teamId, profileId));
    }
    
    public async Task<Result> AcceptJoinRequest(Guid teamId, Guid profileId, Guid acceptInitiatorId)
    {
        return await _repository.GetById(teamId)
            .Bind(entity => entity.MapToDomain())
            .Check(team => team.AcceptJoinRequest(profileId, acceptInitiatorId))
            .Bind(_ => _repository.AcceptJoinRequest(teamId, profileId));
    }
    
    public async Task<Result<List<Team>>> GetTeams(TeamStatus teamStatus)
    {
        return await _repository.GetAllTeams(teamStatus)
            .Bind(entities => entities
                .MapToDomainList(e => e.MapToDomain()));
    }

    public async Task<Result<Team>> GetMyTeam(Guid profileId, TeamStatus status)
    {
        return await _repository.GetByProfileId(profileId, status)
            .Bind(entity => entity.MapToDomain());
    }
    
    public async Task<Result> LeaveTeam(Guid profileId)
    {
        return await _repository.GetByProfileId(profileId)
            .Bind(entity => entity.MapToDomain())
            .Check(team => team.LeaveTeam(profileId))
            .Bind(_ => _repository.DeleteMemberByProfileId(profileId));
    }
    
    public async Task<Result> MakeInactive(Guid profileId)
    {
        return await _repository.GetByProfileId(profileId)
            .Bind(entity => entity.MapToDomain())
            .Bind(team => team.MakeInactive(profileId))
            .Bind(teamId => _repository.MakeInactive(teamId));
    }
    
    public async Task<Result<Team>> GetTeamById(Guid teamId)
    {
        return await _repository.GetById(teamId)
            .Bind(entity => entity.MapToDomain());
    }
}