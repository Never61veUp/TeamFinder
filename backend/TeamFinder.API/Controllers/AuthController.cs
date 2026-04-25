using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamFinder.API.Security;
using TeamFinder.Application.Services;

namespace TeamFinder.API.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class AuthController : BaseController
{
    private readonly IConfiguration _config;
    private readonly JwtTokenService _jwt;
    private readonly ILogger<AuthController> _log;
    private readonly IProfileService _profileService;
    private readonly TelegramWebAppValidator _validator;

    public AuthController(
        TelegramWebAppValidator validator,
        JwtTokenService jwt,
        IConfiguration config,
        ILoggerFactory loggerFactory, IProfileService profileService)
    {
        _validator = validator;
        _jwt = jwt;
        _config = config;
        _profileService = profileService;
        _log = loggerFactory.CreateLogger<AuthController>();
    }

    /// <summary>
    ///     Авторизация через Telegram Web App.
    /// </summary>
    /// <remarks>
    ///     Клиент должен передать initData,
    ///     полученные от Telegram при открытии Web App.
    ///     Сервер проверит их валидность и выдаст JWT,
    ///     который клиент будет использовать для авторизации в дальнейшем.
    /// </remarks>
    [HttpPost("auth/telegram")]
    [AllowAnonymous]
    public async Task<IActionResult> TelegramAuth([FromBody] TelegramAuthRequest body)
    {
        //TODO think about move out of here
        var botToken = _config["TELEGRAM_BOT_TOKEN"];
        if (string.IsNullOrWhiteSpace(botToken))
            return Problem("Missing TELEGRAM_BOT_TOKEN environment variable.", statusCode: 500);

        var result = _validator.ValidateInitData(body.InitData, botToken);
        if (!result.IsValid || result.User is null)
        {
            var initDataLen = body.InitData?.Length ?? 0;
            _log.LogWarning(
                "Telegram auth rejected. reason={Reason} initDataLen={InitDataLen}",
                result.Error ?? "unknown",
                initDataLen);
            return Unauthorized();
        }

        var profile = await _profileService.CreateOrGetByTgId(result.User.TgId, result.User.FirstName);
        if (profile.IsFailure)
            return Problem(profile.Error, statusCode: 500);

        var token = _jwt.CreateToken(profile.Value.Id, result.User, _config);

        return Ok(new TelegramAuthResponse(token, result.User));
    }

    /// <summary>
    ///     Авторизация для разработки.
    /// </summary>
    /// <remarks>Позволяет получить JWT для любого Telegram ID, указав его в теле запроса.</remarks>
    /// <param name="tgId">
    ///     Telegram ID пользователя. Используется только в dev-режиме.
    /// </param>
    [HttpPost("auth/dev")]
    [AllowAnonymous]
    public async Task<IActionResult> DevAuth([FromBody] long tgId)
    {
        //TODO think about move out of here
        if (!bool.TryParse(Environment.GetEnvironmentVariable("ENABLE_DEV_AUTH"), out var devAuth) || !devAuth)
            return NotFound();

        var profile = await _profileService.CreateOrGetByTgId(tgId, "Dev");
        if (profile.IsFailure)
            return Problem(profile.Error, statusCode: 500);

        var user = new TelegramWebAppUser(tgId, "Dev", "Dev", "dev_user", "ru", false);
        var token = _jwt.CreateToken(profile.Value.Id, user, _config);

        return Ok(new TelegramAuthResponse(token, user));
    }

    /// <summary>
    ///     Эндпоинт для проверки работоспособности авторизации.
    /// </summary>
    /// <remarks> Требует JWT в заголовке Authorization.</remarks>
    [HttpGet("me")]
    public IActionResult GetMe()
    {
        var profileId = User.FindFirst("profile:id")?.Value;
        var id = User.FindFirst("tg:id")?.Value;
        var username = User.FindFirst("tg:username")?.Value;
        var firstName = User.FindFirst("tg:first_name")?.Value;
        var lastName = User.FindFirst("tg:last_name")?.Value;

        return Ok(new
        {
            profileId,
            id,
            username,
            firstName,
            lastName
        });
    }
}