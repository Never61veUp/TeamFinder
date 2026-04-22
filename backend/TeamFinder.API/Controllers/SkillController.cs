using TeamFinder.Application.Services;
using TeamFinder.Contracts;
using TeamFinder.Postgresql;

namespace TeamFinder.API.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TeamFinder.Postgresql.Model;

[ApiController]
[Route("api/skills")]
public class SkillController : ControllerBase
{
    private readonly ISkillService _skillService;

    public SkillController(ISkillService skillService)
    {
        _skillService = skillService;
    }
    
    [HttpPost]
    public async Task<IActionResult> Create(CreateSkillRequest request)
    {
        var result = await _skillService.AddSkill(request.Name);
        
        if(result.IsFailure)
            return BadRequest(result.Error);

        return Ok();
    }
    
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        throw new NotImplementedException();
    }
    
    [HttpPost("relation")]
    public async Task<IActionResult> AddRelation(AddSkillRelationRequest request)
    {
        var result = await _skillService.AddRelation(request.ParentId, request.ChildId);
        if(result.IsFailure)
            return BadRequest(result.Error);
        return Ok();
    }
    
    [HttpGet("{id:guid}/children")]
    public async Task<IActionResult> GetChildren(Guid id)
    {
        var children = await _skillService.GetChildren(id);
        if(children.IsFailure)
            return BadRequest(children.Error);
        return Ok(children.Value);
    }
    
    [HttpGet("{id:guid}/parents")]
    public async Task<IActionResult> GetParents(Guid id)
    {
        var parents = await _skillService.GetParents(id);
        if(parents.IsFailure)
            return BadRequest(parents.Error);
        
        return Ok(parents.Value);
    }
}