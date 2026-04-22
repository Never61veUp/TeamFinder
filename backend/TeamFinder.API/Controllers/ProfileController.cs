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
    /// <summary>
    /// Не используется в текущей версии, так как профили создаются
    /// автоматически при авторизации через Telegram. Но может пригодиться для админки или для ручного создания профилей.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create(CreateProfileRequest request)
    {
        var result = await _profileService.Create(request.Name);
        
        if(result.IsFailure)
            return  BadRequest(result.Error);

        return Ok(result.Value);
    }
    /// <summary>
    /// Получить полный профиль по ID. Включая все его поля и связанные сущности (например, навыки). Используется для отображения профиля в личном кабинете пользователя.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var profile = await _profileService.GetById(id);

        if (profile.IsFailure)
            return BadRequest(profile.Error);

        return Ok(profile.Value);
    }
    /// <summary>
    /// Добавить навык к профилю. Клиент должен передать ID профиля и ID навыка, который он хочет добавить.
    /// Сервер должен проверить, что оба ID валидные, и что навык существует,
    /// а затем добавить связь между профилем и навыком в базе данных.
    /// </summary>
    [HttpPost("{profileId:guid}/skills/{skillId:guid}")]
    public async Task<IActionResult> AddSkill(Guid profileId, Guid skillId)
    {
        var result = await _profileService.AddSkill(profileId, skillId);
        if (result.IsFailure)
            return BadRequest(result.Error);
        return Ok();
    }
    /// <summary>
    /// Получить скилл лист профиля. Клиент должен передать ID профиля, и
    /// сервер должен вернуть список навыков, связанных с этим профилем.
    /// Используется для отображения навыков в личном кабинете пользователя и на странице профиля.
    /// </summary>
    [HttpGet("{profileId:guid}/skills")]
    public async Task<IActionResult> GetSkills(Guid profileId)
    {
        var profile = await _profileService.GetById(profileId);

        if (profile.IsFailure)
            return BadRequest(profile.Error);

        return Ok(profile.Value.Skills);
    }
    
    /// <summary>
    /// Получить всех пользователей с определенным навыком. Клиент должен передать
    /// ID навыка, и сервер должен вернуть список профилей, которые связаны с этим навыком. Используется для функции поиска по навыкам.
    /// </summary>
    [HttpGet("search/{skillId:guid}")]
    public async Task<IActionResult> SearchBySkill(Guid skillId)
    {
        var result = await _profileService.GetBySkill(skillId);

        return Ok(result);
    }
    /// <summary>
    /// Получить пользователя с информацией из GitHub. Клиент должен передать ID профиля,
    /// и сервер должен вернуть профиль вместе с информацией из GitHub, которая связана с этим профилем (например, имя пользователя GitHub,
    /// количество репозиториев, список языков программирования и т.д.).
    /// Используется для отображения информации из GitHub в личном кабинете пользователя и на странице профиля.
    /// </summary>
    [HttpGet("{profileId:guid}/gitstats")]
    public async Task<IActionResult> GetWithGithubInfo(Guid profileId)
    {
        var result = await _profileService.GetWithGithubInfoById(profileId);
    
        return Ok(result.Value);
    }
}