using CSharpFunctionalExtensions;
using TeamFinder.Core.Model.Teams;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Postgresql.Abstractions;

public interface ITeamRepository
{
    Task<Result> SaveTeam(TeamEntity team);
    Task<Result<TeamEntity>> GetById(Guid id, TeamStatus status = TeamStatus.Active);
    Task<Result> AddInvitation(InvitationEntity invitationEntity);
    Task<Result> AddJoinRequest(Guid teamId, Guid profileId);
    Task<Result> AcceptJoinRequest(Guid teamId, Guid profileId);
    Task<Result<IEnumerable<TeamEntity>>> GetAllTeams();
    Task<Result<TeamEntity>> GetByProfileId(Guid id, TeamStatus status = TeamStatus.Active);
    Task<Result> DeleteMemberByProfileId(Guid profileId);
    Task<Result> MakeInactive(Guid teamId);
    Task<Result> AddMember(Guid teamId, Guid profileId);
    Task<Result<List<TeamEntity>>> GetTeamsByProfileId(Guid id, TeamStatus status = TeamStatus.Active);
}