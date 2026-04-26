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
        return await Team.Create(Guid.NewGuid(), ownerId, [], name, maxMembers)
            .Map(team => team.MapToEntity())
            .Bind(entity => _repository.SaveTeam(entity));
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
    
    public async Task<Result<List<Team>>> GetTeams()
    {
        return await _repository.GetAllTeams()
            .Bind(entities => entities
                .MapToDomainList(e => e.MapToDomain()));
    }
}