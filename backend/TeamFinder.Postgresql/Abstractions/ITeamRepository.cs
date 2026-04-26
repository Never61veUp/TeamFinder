using CSharpFunctionalExtensions;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Postgresql.Abstractions;

public interface ITeamRepository
{
    Task<Result> SaveTeam(TeamEntity team);
    Task<Result<TeamEntity>> GetById(Guid id);
    Task<Result> AddInvitation(InvitationEntity invitationEntity);
    Task<Result> AddJoinRequest(Guid teamId, Guid profileId);
    Task<Result> AcceptJoinRequest(Guid teamId, Guid profileId);
}