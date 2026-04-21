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
    
    [HttpGet("login")]
    public IActionResult Login()
    {
        var clientId = _config["GitHub:ClientId"];
        var profileId = User.FindFirst("sub")?.Value;
        if(!Guid.TryParse(profileId, out var profileGuid))
            return BadRequest("Invalid profile ID.");
        var redirectUrl = $"https://github.com/login/oauth/authorize?client_id={clientId}&state={profileGuid}";

        return Redirect(redirectUrl);
    }
    
    [HttpGet("callback")]
    public async Task<IActionResult> Callback(string code, string state)
    {
        var clientId = _config["GitHub:ClientId"];
        var clientSecret = _config["GitHub:ClientSecret"];

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