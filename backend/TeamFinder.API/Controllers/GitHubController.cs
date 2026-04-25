using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamFinder.Application.Services;

namespace TeamFinder.API.Controllers;

[ApiController]
[Route("api/github")]
[Authorize]
public class GitHubController : BaseController
{
    private readonly IGithubService _githubAppService;
    private readonly IProfileService _profileService;
    private readonly IGitHubServiceExternal _serviceExternal;

    public GitHubController(IGitHubServiceExternal serviceExternal,
        IGithubService githubAppService, IProfileService profileService)
    {
        _serviceExternal = serviceExternal;
        _githubAppService = githubAppService;
        _profileService = profileService;
    }

    /// <summary>
    ///     Инициирует процесс авторизации через GitHub.
    /// </summary>
    /// <remarks>
    ///     Клиент должен быть уже авторизован
    ///     в системе (например, через Telegram), и у него должен быть действующий JWT. Сервер проверит JWT,
    ///     извлечет из него ID профиля, и сформирует URL для перенаправления пользователя на страницу авторизации GitHub.
    ///     Клиент должен будет открыть этот URL, пройти авторизацию
    /// </remarks>
    [HttpGet("login")]
    public IActionResult Login()
    {
        //TODO think about move out of here
        var githubClientId = Environment.GetEnvironmentVariable("GITHUB_CLIENT_ID");
        if (string.IsNullOrWhiteSpace(githubClientId))
            return NotFound();
        
        var redirectUrl = $"https://github.com/login/oauth/authorize?client_id={githubClientId}&state={CurrentProfileId}";
        return Ok(new { url = redirectUrl });
    }

    /// <summary>
    ///     Обрабатывает callback от GitHub после успешной авторизации пользователя.
    /// </summary>
    /// <remarks>
    ///     GitHub перенаправит пользователя на этот URL,
    ///     передав в query параметры code и state. Сервер должен будет использовать code для получения access token от GitHub,
    ///     а state использовать для извлечения ID профиля. Затем сервер должен будет получить информацию о пользователе из
    ///     GitHub,
    ///     создать или обновить запись в базе данных, связывающую профиль с GitHub аккаунтом, и вернуть успешный ответ
    ///     клиенту.
    ///     Если на любом этапе возникнет ошибка (например, не удастся получить access token или информацию о пользователе),
    ///     сервер должен вернуть соответствующий код ошибки и сообщение.
    /// </remarks>
    [HttpGet("callback")]
    [AllowAnonymous]
    public async Task<IActionResult> Callback(string code, string state)
    {
        if (string.IsNullOrWhiteSpace(code) || string.IsNullOrWhiteSpace(state))
            return BadRequest("Invalid callback request.");
        
        //TODO think about move out of here
        var clientId = Environment.GetEnvironmentVariable("GITHUB_CLIENT_ID");
        var clientSecret = Environment.GetEnvironmentVariable("GITHUB_CLIENT_SECRET");

        var accessToken = await _serviceExternal.GetAccessToken(code, clientId, clientSecret);

        var userJson = await _serviceExternal.GetUser(accessToken);

        var root = userJson.RootElement;

        var githubId = root.GetProperty("id").ToString();
        var username = root.GetProperty("login").GetString();

        var profileId = Guid.Parse(state);

        var githubInfoResult = await _githubAppService
            .CreateGithubInfo(githubId, username, accessToken);
        if (githubInfoResult.IsFailure)
            return BadRequest(githubInfoResult.Error);

        var connectResult = await _profileService
            .ConnectGithub(profileId, githubInfoResult.Value);
        if (connectResult.IsFailure)
            return BadRequest(connectResult.Error);

        return Ok();
    }
}