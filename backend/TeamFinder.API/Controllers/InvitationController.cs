using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamFinder.Application.Services;
using TeamFinder.Core.Model.Teams;

namespace TeamFinder.API.Controllers;

[ApiController]
[Route("api/invitations")]
[Authorize]
public class InvitationController : BaseController
{
    private readonly IInvitationService _invitationService;

    public InvitationController(IInvitationService invitationService)
    {
        _invitationService = invitationService;
    }
    
    /// <summary>
    /// Список инвайтов текущего профиля.
    /// </summary>
    /// <param name="invitationStatus">
    /// Необязательный параметр. По дефолту - Pending
    /// Pending = 0,
    ///Accepted = 1,
    ///Revoked = 2,
    ///Expired = 3
    /// </param>
    /// <returns></returns>
    [HttpGet]
    public async Task<IActionResult> GetInvitation(InvitationStatus invitationStatus = InvitationStatus.Pending)
    {
        var result = await _invitationService.GetInvitationsByInviteeProfileId(CurrentProfileId, invitationStatus);
        if(result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok(result.Value);
    }
    
    [HttpPost("accept/{invitationId:guid}")]
    public async Task<IActionResult> AcceptInvitation(Guid invitationId)
    {
        var result = await _invitationService.AcceptInvitation(invitationId, CurrentProfileId);
        if(result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok();
    }
}