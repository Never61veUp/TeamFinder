using Microsoft.AspNetCore.Mvc;
using TeamFinder.Application.Services;

namespace TeamFinder.API.Controllers;

[ApiController]
[Route("api/github")]
public class GitHubContreoller : ControllerBase
{
    private readonly IGitHubServiceExternal _serviceExternal;
    private readonly IConfiguration _config;
    private readonly IGitHubServiceExternal _githubServiceExternal;
    private readonly IGithubService _githubAppService;
    private readonly IProfileService _profileService;

    public GitHubContreoller(IGitHubServiceExternal serviceExternal, 
        IConfiguration config, IGitHubServiceExternal githubServiceExternal, 
        IGithubService githubAppService, IProfileService profileService)
    {
        _serviceExternal = serviceExternal;
        _config = config;
        _githubServiceExternal = githubServiceExternal;
        _githubAppService = githubAppService;
        _profileService = profileService;
    }
    
    /// <summary>
    /// Инициирует процесс авторизации через GitHub.
    /// </summary>
    /// <remarks>
    /// Клиент должен быть уже авторизован
    /// в системе (например, через Telegram), и у него должен быть действующий JWT. Сервер проверит JWT,
    /// извлечет из него ID профиля, и сформирует URL для перенаправления пользователя на страницу авторизации GitHub.
    /// Клиент должен будет открыть этот URL, пройти авторизацию
    /// </remarks>
    [HttpGet("login")]
    public IActionResult Login()
    {
        var githubClientId = Environment.GetEnvironmentVariable("GITHUB_CLIENT_ID");
        if (string.IsNullOrWhiteSpace(githubClientId))
            return NotFound();
        var profileId = User.FindFirst("profile:id")?.Value;
        if(!Guid.TryParse(profileId, out var profileGuid))
            return BadRequest("Invalid profile ID.");
        var redirectUrl = $"https://github.com/login/oauth/authorize?client_id={githubClientId}&state={profileGuid}";
        if (bool.TryParse(Environment.GetEnvironmentVariable("ENABLE_DEV_AUTH"), out var devAuth) || !devAuth)
            return Ok(redirectUrl);
        return Redirect(redirectUrl);
    }
    /// <summary>
    /// Обрабатывает callback от GitHub после успешной авторизации пользователя.
    /// </summary>
    /// <remarks>
    /// GitHub перенаправит пользователя на этот URL,
    /// передав в query параметры code и state. Сервер должен будет использовать code для получения access token от GitHub,
    /// а state использовать для извлечения ID профиля. Затем сервер должен
    /// </remarks>
    [HttpGet("callback")]
    public async Task<IActionResult> Callback(string code, string state)
    {
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