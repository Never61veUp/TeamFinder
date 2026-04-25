using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamFinder.Application.Services;
using TeamFinder.Contracts;

namespace TeamFinder.API.Controllers;

[ApiController]
[Route("api/profiles")]
[Authorize]
public class ProfileController : BaseController
{
    private readonly IProfileService _profileService;

    public ProfileController(IProfileService profileService)
    {
        _profileService = profileService;
    }

    /// <summary>
    ///     Не используется в текущей версии.
    /// </summary>
    /// <remarks>
    ///     Профили создаются автоматически при авторизации через Telegram.
    /// </remarks>
    [HttpPost]
    public async Task<IActionResult> Create(CreateProfileRequest request)
    {
        var result = await _profileService.Create(request.Name);
        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }

    /// <summary>
    ///     Получить профиль по ID.
    /// </summary>
    /// <remarks>
    ///     Включая поле навыки. Не включая гитхаб.
    /// </remarks>
    /// <param name="id">
    ///     ID профиля в нашей системе. Не путать с ID из Telegram или GitHub.
    /// </param>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var profile = await _profileService.GetById(id);
        if (profile.IsFailure)
            return BadRequest(profile.Error);

        return Ok(profile.Value);
    }
    
    /// <summary>
    ///     Получить свой профиль.
    /// </summary>
    /// <remarks>
    ///     Включая поле навыки и гитхаб.
    /// </remarks>
    [HttpGet]
    public async Task<IActionResult> GetMyProfile()
    {
        var profile = await _profileService.GetById(CurrentProfileId);
        if (profile.IsFailure)
            return BadRequest(profile.Error);

        return Ok(profile.Value);
    }

    /// <summary>
    ///     Добавить навык к профилю.
    /// </summary>
    /// <remarks>
    ///     Клиент должен передать ID профиля и ID навыка, который он хочет добавить.
    ///     Сервер должен проверить, что оба ID валидные, и что навык существует,
    ///     а затем добавить связь между профилем и навыком в базе данных.
    /// </remarks>
    [HttpPost("{profileId:guid}/skills/{skillId:guid}")]
    public async Task<IActionResult> AddSkill(Guid profileId, Guid skillId)
    {
        var result = await _profileService.AddSkill(profileId, skillId);
        if (result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok();
    }
    
    /// <summary>
    ///     Добавить навык к своему профилю.
    /// </summary>
    /// <remarks>
    ///     Клиент должен передать ID навыка, который он хочет добавить.
    ///     Сервер должен проверить ID валидные, и что навык существует,
    /// </remarks>
    [HttpPost("/skills/{skillId:guid}")]
    public async Task<IActionResult> AddSkill(Guid skillId)
    {
        var result = await _profileService.AddSkill(CurrentProfileId, skillId);
        if (result.IsFailure)
            return BadRequest(result.Error);
        
        return Ok();
    }

    /// <summary>
    ///     Получить скилл лист профиля.
    /// </summary>
    /// <remarks>
    ///     Клиент должен передать ID профиля, и
    ///     сервер должен вернуть список навыков, связанных с этим профилем.
    ///     Используется для отображения навыков в личном кабинете пользователя и на странице профиля.
    /// </remarks>
    [HttpGet("{profileId:guid}/skills")]
    public async Task<IActionResult> GetSkills(Guid profileId)
    {
        var profile = await _profileService.GetById(profileId);
        if (profile.IsFailure)
            return BadRequest(profile.Error);

        return Ok(profile.Value.Skills);
    }
    
    /// <summary>
    ///     Получить скилл лист своего профиля.
    /// </summary>
    /// <remarks>
    ///     Возвращает скилы текущего пользователя
    /// </remarks>
    [HttpGet("skills")]
    public async Task<IActionResult> GetSkills()
    {
        var profile = await _profileService.GetById(CurrentProfileId);
        if (profile.IsFailure)
            return BadRequest(profile.Error);

        return Ok(profile.Value.Skills);
    }

    /// <summary>
    ///     Получить всех пользователей с определенным навыком.
    /// </summary>
    /// <remarks>
    ///     Клиент должен передать
    ///     ID навыка, и сервер должен вернуть список профилей вместе со списком навыков, которые связаны с этим навыком.
    /// </remarks>
    /// <param name="skillId">
    ///     ID навыка
    /// </param>
    [HttpGet("search/{skillId:guid}")]
    public async Task<IActionResult> SearchBySkill(Guid skillId)
    {
        var result = await _profileService.GetBySkill(skillId);
        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result);
    }
}