using CSharpFunctionalExtensions;
using TeamFinder.Contracts;
using TeamFinder.Core.Model.Teams;

namespace TeamFinder.Application.Abstractions;

public interface ITeamService
{
    Task<Result> CreateTeam(Guid ownerId, string name, int maxMembers, string? description, string? eventTitle,
        DateOnly? eventStart, DateOnly? eventEnd, List<Tag> tags);
    Task<Result> InviteProfile(Guid teamId, Guid inviterId, Guid inviteeId);
    Task<Result> CreateJoinRequest(Guid teamId, Guid profileId);
    Task<Result> AcceptJoinRequest(Guid teamId, Guid profileId, Guid acceptInitiatorId);
    Task<Result<List<Team>>> GetTeams();
    Task<Result<Team>> GetMyTeam(Guid profileId);
    Task<Result> LeaveTeam(Guid profileId);
    Task<Result> MakeInactive(Guid profileId);
    Task<Result<Team>> GetTeamById(Guid teamId);
}