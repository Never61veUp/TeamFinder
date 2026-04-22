using Microsoft.AspNetCore.Mvc;
using TeamFinder.Application.Services;
using TeamFinder.Contracts;
using TeamFinder.Core.Model;
using TeamFinder.Postgresql.Repositories;

namespace TeamFinder.API.Controllers;

[ApiController]
[Route("api/profiles")]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;

    public ProfileController(
        IProfileService profileService)
    {
        _profileService = profileService;
    }
    
    [HttpPost]
    public async Task<IActionResult> Create(CreateProfileRequest request)
    {
        var result = await _profileService.Create(request.Name);
        
        if(result.IsFailure)
            return  BadRequest(result.Error);

        return Ok(result.Value);
    }
    
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var profile = await _profileService.GetById(id);

        if (profile.IsFailure)
            return BadRequest(profile.Error);

        return Ok(profile.Value);
    }
    
    [HttpPost("{profileId:guid}/skills/{skillId:guid}")]
    public async Task<IActionResult> AddSkill(Guid profileId, Guid skillId)
    {
        var result = await _profileService.AddSkill(profileId, skillId);
        if (result.IsFailure)
            return BadRequest(result.Error);
        return Ok();
    }
    
    [HttpGet("{profileId:guid}/skills")]
    public async Task<IActionResult> GetSkills(Guid profileId)
    {
        var profile = await _profileService.GetById(profileId);

        if (profile.IsFailure)
            return BadRequest(profile.Error);

        return Ok(profile.Value.Skills);
    }
    
    [HttpGet("search/{skillId:guid}")]
    public async Task<IActionResult> SearchBySkill(Guid skillId)
    {
        var result = await _profileService.GetBySkill(skillId);

        return Ok(result);
    }
    
    [HttpGet("{profileId:guid}/gitstats")]
    public async Task<IActionResult> GetWithGithubInfo(Guid profileId)
    {
        var result = await _profileService.GetWithGithubInfoById(profileId);
    
        return Ok(result.Value);
    }
}