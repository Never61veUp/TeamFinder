using CSharpFunctionalExtensions;
using TeamFinder.Core.Model.Teams;
using TeamFinder.Postgresql.Repositories;

namespace TeamFinder.Application.Services;

public class TeamService
{
    private readonly ITeamRepository _repository;

    public TeamService(ITeamRepository repository)
    {
        _repository = repository;
    }
    public async Task<Result> CreateTeam(Guid ovnerId, string name, int maxMembers)
    {
        var team = Team.Create(ovnerId, name, maxMembers);
        if(team.IsFailure)
            return Result.Failure(team.Error);
        return await _repository.SaveTeam(team.Value);
    }

    public async Task<Result> InviteProfile(Guid teamId, Guid inviterId, Guid inviteeId)
    {
        var team = await _repository.GetById(teamId);
        if(team.IsFailure)
            return Result.Failure(team.Error);
        
        team.Value.SendInvitation(inviterId, inviteeId);
        throw  new NotImplementedException();
    }
}