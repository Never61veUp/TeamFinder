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
    
    [HttpGet()]
    public async Task<IActionResult> GetInvitation(InvitationStatus invitationStatus = InvitationStatus.Pending)
    {
        var result = await _invitationService.GetInvitationsByInviteeProfileId(Guid.Parse("2e35f148-208b-47fe-b4a7-fa93201c8edf"), invitationStatus);
        if(result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok(result.Value);
    }
}