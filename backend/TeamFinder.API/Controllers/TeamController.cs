using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamFinder.Application.Services;
using TeamFinder.Contracts;

namespace TeamFinder.API.Controllers;

[ApiController]
[Route("api/teams")]
[Authorize]
public class TeamController : BaseController
{
    private readonly ITeamService _teamService;

    public TeamController(ITeamService teamService)
    {
        _teamService = teamService;
    }
    
    [HttpPost]
    public async Task<IActionResult> CreateTeam([FromBody] CreateTeamRequest request)
    {
        var result = await _teamService.CreateTeam(CurrentProfileId, request.TeamName, request.MaxMembers);
        if(result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok();
    }
    
    [HttpPost("invite")]
    public async Task<IActionResult> InviteProfile(InviteProfileRequest request)
    {
        var result = await _teamService.InviteProfile(request.TeamId, CurrentProfileId, request.InviteeId);
        if(result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok();
    }
}