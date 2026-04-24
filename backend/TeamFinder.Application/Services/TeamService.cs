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
        var team = Team.Create(Guid.NewGuid(), ownerId, [], name, maxMembers);
        if (team.IsFailure)
            return Result.Failure(team.Error);
        return await _repository.SaveTeam(team.Value.MapToEntity());
    }

    public async Task<Result<Guid>> InviteProfile(Guid teamId, Guid inviterId, Guid inviteeId)
    {
        throw new NotImplementedException();
    }
}