using CSharpFunctionalExtensions;
using TeamFinder.Application.Mapping;
using TeamFinder.Core.Model.Teams;
using TeamFinder.Postgresql.Repositories;

namespace TeamFinder.Application.Services;

public interface ITeamService
{
    Task<Result> CreateTeam(Guid ownerId, string name, int maxMembers);
    Task<Result<Guid>> InviteProfile(Guid teamId, Guid inviterId, Guid inviteeId);
}

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

    public async Task<Result<Guid>> InviteProfile(Guid teamId, Guid inviterId, Guid inviteeId)
    {
        var teamResult = await _repository.GetById(teamId);
        if (teamResult.IsFailure)
            return Result.Failure<Guid>(teamResult.Error);

        var team = teamResult.Value.MapToDomain();
        var inviteResult = team.SendInvitation(inviterId, inviteeId);
        if (inviteResult.IsFailure)
            return Result.Failure<Guid>(inviteResult.Error);

        var invitationId = inviteResult.Value;
        var saveResult = await _repository.SaveTeam(team.MapToEntity());
        if (saveResult.IsFailure)
            return Result.Failure<Guid>(saveResult.Error);

        return Result.Success(invitationId);
    }
}