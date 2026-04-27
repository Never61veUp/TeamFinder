using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamFinder.Application.Abstractions;
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
    
    [HttpPost("{teamId:guid}/invitations/{inviteeId:guid}")]
    public async Task<IActionResult> InviteProfile(Guid teamId, Guid inviteeId)
    {
        var result = await _teamService.InviteProfile(teamId, CurrentProfileId, inviteeId);
        if(result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok();
    }

    [HttpPost("{teamId:guid}/request-join/")]
    public async Task<IActionResult> RequestToJoin(Guid teamId)
    {
        var result = await _teamService.CreateJoinRequest(teamId, CurrentProfileId);
        if(result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok();
    }

    [HttpPost("{teamId:guid}/accept-join/{requestedProfileId:guid}")]
    public async Task<IActionResult> AcceptJoinRequest(Guid teamId, Guid requestedProfileId)
    {
        var result = await _teamService.AcceptJoinRequest(teamId, requestedProfileId, CurrentProfileId);
        if(result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok();
    }
    
    [HttpGet]
    public async Task<IActionResult> GetTeams()
    {
        var result = await _teamService.GetTeams();
        if(result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok(result.Value);
    }
}