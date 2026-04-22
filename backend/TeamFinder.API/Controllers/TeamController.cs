using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamFinder.Application.Services;

namespace TeamFinder.API.Controllers;

[ApiController]
[Route("api/teams")]
public class TeamController : ControllerBase
{
    private readonly ITeamService _teamService;

    public TeamController(ITeamService teamService)
    {
        _teamService = teamService;
    }
    
    [HttpPost]
    public async Task<IActionResult> CreateTeam([FromBody] CreateTeamRequest request)
    {
        var profileId = User.FindFirst("profile:id")?.Value;
        if(!Guid.TryParse(profileId, out var profileGuid))
            return Unauthorized();
        
        var result = await _teamService.CreateTeam(profileGuid, request.TeamName, request.MaxMembers);
        if(result.IsFailure)
            return BadRequest(result.Error);
        return Ok();
    }
}
public record CreateTeamRequest(string TeamName, int MaxMembers);