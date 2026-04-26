using CSharpFunctionalExtensions;
using TeamFinder.Core.Model.Teams;

namespace TeamFinder.Application.Abstractions;

public interface ITeamService
{
    Task<Result> CreateTeam(Guid ownerId, string name, int maxMembers);
    Task<Result> InviteProfile(Guid teamId, Guid inviterId, Guid inviteeId);
    Task<Result> CreateJoinRequest(Guid teamId, Guid profileId);
    Task<Result> AcceptJoinRequest(Guid teamId, Guid profileId, Guid acceptInitiatorId);
    Task<Result<List<Team>>> GetTeams();
}