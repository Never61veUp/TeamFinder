using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamFinder.Application.Abstractions;
using TeamFinder.Application.Services;
using TeamFinder.Contracts;
using TeamFinder.Core.Model.Teams;

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
        var result = await _teamService.CreateTeam(CurrentProfileId, request.TeamName, 
            request.MaxMembers, request.Description, 
            request.EventName, request.EventStart, request.EventEnd, request.Tags);
        if(result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok();
    }
    
    [HttpGet("{teamId:guid}")]
    public async Task<IActionResult> GetTeamById(Guid teamId)
    {
        var result = await _teamService.GetTeamById(teamId);
        if(result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok(result.Value);
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
    
    [HttpGet("all")]
    public async Task<IActionResult> GetTeams([FromQuery] GetAllTeamsRequest request)
    {
        var result = await _teamService.GetTeams(request.Status, request.From, request.Count);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }
    
    [AllowAnonymous]
    [HttpGet("event-tags")]
    public async Task<IActionResult> GetEventTags()
    {
        //TODO rewrite
        var tags = Enum.GetValues<Tag>()
            .Select(t => new 
            { 
                Id = (int)t, 
                Name = t.ToString() 
            });
        return Ok(tags);
    }

    [HttpGet("my-team")]
    public async Task<IActionResult> GetMyTeam([FromQuery] TeamStatus status = TeamStatus.Active)
    {
        var result = await _teamService.GetMyTeam(CurrentProfileId, status);
        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }
    
    [HttpGet("my-team-list")]
    public async Task<IActionResult> GetMyTeamList([FromQuery] TeamStatus status = TeamStatus.Inactive)
    {
        var result = await _teamService.GetMyTeamList(CurrentProfileId, status);
        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }
    
    [HttpPost("leave")]
    public async Task<IActionResult> LeaveTeam()
    {
        var result = await _teamService.LeaveTeam(CurrentProfileId);
        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok();
    }
    
    [HttpPost("make-inactive")]
    public async Task<IActionResult> DisbandTeam()
    {
        var result = await _teamService.MakeInactive(CurrentProfileId);
        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok();
    }
}

public record GetAllTeamsRequest(TeamStatus Status = TeamStatus.Active, int From = 0, int Count = 5);