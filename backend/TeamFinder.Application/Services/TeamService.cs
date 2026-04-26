using CSharpFunctionalExtensions;
using TeamFinder.Application.Abstractions;
using TeamFinder.Application.Mapping;
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

    public async Task<Result> CreateTeam(Guid ownerId, string name, int maxMembers)
    {
        var team = Team.Create(ownerId, name, maxMembers);
        if (team.IsFailure)
            return Result.Failure(team.Error);
        
        return await _repository.SaveTeam(team.Value.MapToEntity());
    }

    public async Task<Result> InviteProfile(Guid teamId, Guid inviterId, Guid inviteeId)
    {
        var teamEntity = await _repository.GetById(teamId);
        if (teamEntity.IsFailure)
            return Result.Failure<Guid>(teamEntity.Error);
        
        var team = teamEntity.Value.MapToDomain();
        
        var inviteResult = team.Value.SendInvitation(inviterId, inviteeId);
        if(inviteResult.IsFailure)
            return Result.Failure<Guid>(inviteResult.Error);
        
        return await _repository.AddInvitation(inviteResult.Value.MapToEntity());
    }
    
    public async Task<Result> CreateJoinRequest(Guid teamId, Guid profileId)
    {
        var teamEntity = await _repository.GetById(teamId);
        if (teamEntity.IsFailure)
            return Result.Failure(teamEntity.Error);
        
        var team = teamEntity.Value.MapToDomain();
        
        var requestResult = team.Value.RequestToJoin(profileId);
        if(requestResult.IsFailure)
            return Result.Failure(requestResult.Error);
        
        return await _repository.AddJoinRequest(teamId, profileId);
    }
    
    public async Task<Result> AcceptJoinRequest(Guid teamId, Guid profileId, Guid acceptInitiatorId)
    {
        var teamEntity = await _repository.GetById(teamId);
        if (teamEntity.IsFailure)
            return Result.Failure(teamEntity.Error);
        
        var team = teamEntity.Value.MapToDomain();
        
        var acceptResult = team.Value.AcceptJoinRequest(profileId: profileId, 
            acceptInitiatorId: acceptInitiatorId);
        if(acceptResult.IsFailure)
            return Result.Failure(acceptResult.Error);
        
        return await _repository.AcceptJoinRequest(teamId, profileId);
    }
}