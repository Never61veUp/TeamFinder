using CSharpFunctionalExtensions;
using TeamFinder.Application.Mapping;
using TeamFinder.Core.Model.Teams;
using TeamFinder.Postgresql.Model;
using TeamFinder.Postgresql.Repositories;

namespace TeamFinder.Application.Services;

public interface IInvitationService
{
    Task<Result<List<Invitation>>> GetInvitationsByInviteeProfileId(Guid inviteeId, InvitationStatus status = InvitationStatus.Pending);
}

public class InvitationService : IInvitationService
{
    private readonly IInvitationRepository _invitationRepository;

    public InvitationService(IInvitationRepository invitationRepository)
    {
        _invitationRepository = invitationRepository;
    }
    
    public async Task<Result<List<Invitation>>> GetInvitationsByInviteeProfileId(Guid inviteeId, InvitationStatus status = InvitationStatus.Pending)
    {
        return await _invitationRepository.GetInvitationsByInviteeProfileId(inviteeId, status)
            .Bind(invitationEntities => invitationEntities
                .MapToDomainList(d => d.MapToDomain()));
    }
}