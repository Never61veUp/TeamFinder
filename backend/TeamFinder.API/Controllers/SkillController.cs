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
    /// <summary>
    /// Создать новый навык.
    /// </summary>
    /// <remarks> Временменное решение для разработки. Не создает связи между навыками,
    /// просто добавляет новый навык в базу данных.
    /// </remarks>
    /// <param name="request"></param>
    [HttpPost]
    public async Task<IActionResult> Create(CreateSkillRequest request)
    {
        var result = await _skillService.AddSkill(request.Name);
        
        if(result.IsFailure)
            return BadRequest(result.Error);

        return Ok();
    }
    /// <summary>
    /// Получить все навыки в виде дерева.
    /// </summary>
    /// <remarks> Временное решение для разработки, позже будет удалено</remarks>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _skillService.GetSkillsTreeDev();
        return Ok(result.Value);
    }
    /// <summary>
    /// Создать отношение между навыками. 
    /// </summary>
    /// <remarks>Например, "Программирование" - родительский навык для "backend".</remarks>
    /// <param name="request"></param>
    [HttpPost("relation")]
    public async Task<IActionResult> AddRelation(AddSkillRelationRequest request)
    {
        var result = await _skillService.AddRelation(request.ParentId, request.ChildId);
        if(result.IsFailure)
            return BadRequest(result.Error);
        return Ok();
    }
    /// <summary>
    /// Получить один уровень детей для данного навыка.
    /// </summary>
    /// <remarks>Например, для "Программирование" это будет "backend", "frontend", "mobile" и т.д.
    /// </remarks>
    /// <param name="id">Id навыка</param>
    /// <returns></returns>
    [HttpGet("{id:guid}/children")]
    public async Task<IActionResult> GetChildren(Guid id)
    {
        var children = await _skillService.GetChildren(id);
        if(children.IsFailure)
            return BadRequest(children.Error);
        return Ok(children.Value);
    }
    /// <summary>
    /// Получить один уровень родителей для данного навыка.
    /// </summary>
    /// <remarks> Например, для "backend" это будет "Программирование".</remarks>
    /// <param name="id">ID навыка</param>
    [HttpGet("{id:guid}/parents")]
    public async Task<IActionResult> GetParents(Guid id)
    {
        var parents = await _skillService.GetParents(id);
        if(parents.IsFailure)
            return BadRequest(parents.Error);
        
        return Ok(parents.Value);
    }
}