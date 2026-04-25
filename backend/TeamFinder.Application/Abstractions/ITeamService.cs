using CSharpFunctionalExtensions;

namespace TeamFinder.Application.Abstractions;

public interface ITeamService
{
    Task<Result> CreateTeam(Guid ownerId, string name, int maxMembers);
    Task<Result<Guid>> InviteProfile(Guid teamId, Guid inviterId, Guid inviteeId);
}