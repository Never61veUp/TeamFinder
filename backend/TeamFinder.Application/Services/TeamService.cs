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
        var team = Team.Create(Guid.NewGuid(), ownerId, [], name, maxMembers);
        if (team.IsFailure)
            return Result.Failure(team.Error);
        return await _repository.SaveTeam(team.Value.MapToEntity());
    }

    public async Task<Result<Guid>> InviteProfile(Guid teamId, Guid inviterId, Guid inviteeId)
    {
        var teamEntity = await _repository.GetById(teamId);
        if (teamEntity.IsFailure)
            return Result.Failure<Guid>(teamEntity.Error);
        var team = teamEntity.Value.MapToDomain();
        var inviteResult = team.Value.SendInvitation(inviterId, inviteeId);
        if(inviteResult.IsFailure)
            return Result.Failure<Guid>(inviteResult.Error);
        await _repository.UpdateTeam(team.Value.MapToEntity());
        return Guid.NewGuid();
    }
}