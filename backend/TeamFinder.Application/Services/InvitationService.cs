using CSharpFunctionalExtensions;
using TeamFinder.Application.Mapping;
using TeamFinder.Core.Model.Teams;
using TeamFinder.Postgresql.Abstractions;
using TeamFinder.Postgresql.Model;
using TeamFinder.Postgresql.Repositories;

namespace TeamFinder.Application.Services;

public interface IInvitationService
{
    Task<Result<List<Invitation>>> GetInvitationsByInviteeProfileId(Guid inviteeId, InvitationStatus status = InvitationStatus.Pending);
    Task<Result> AcceptInvitation(Guid invitationId);
}

public class InvitationService : IInvitationService
{
    private readonly IInvitationRepository _invitationRepository;
    private readonly ITeamRepository _teamRepository;

    public InvitationService(IInvitationRepository invitationRepository, ITeamRepository teamRepository)
    {
        _invitationRepository = invitationRepository;
        _teamRepository = teamRepository;
    }
    
    public async Task<Result<List<Invitation>>> GetInvitationsByInviteeProfileId(Guid inviteeId, InvitationStatus status = InvitationStatus.Pending)
    {
        return await _invitationRepository.GetInvitationsByInviteeProfileId(inviteeId, status)
            .Bind(invitationEntities => invitationEntities
                .MapToDomainList(d => d.MapToDomain()));
    }
    
    public async Task<Result> AcceptInvitation(Guid invitationId)
    {
        var invitationResult = await _invitationRepository.GetInvitationById(invitationId);
        if (invitationResult.IsFailure) 
            return invitationResult;

        var invitation = invitationResult.Value;
        
        var teamResult = await _teamRepository.GetById(invitation.TeamId);
        if (teamResult.IsFailure) 
            return teamResult;
        
        var team = teamResult.Value.MapToDomain().Value;
        
        var addMemberResult = team.AcceptInvitation(invitation.InviteeId);
        if (addMemberResult.IsFailure) 
            return addMemberResult;
        
        await _teamRepository.AddMember(team.Id, invitation.InviteeId);
        
        var acceptResult = await _invitationRepository.AcceptInvitation(invitationId);

        return acceptResult;
    }
}