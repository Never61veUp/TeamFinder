using Microsoft.AspNetCore.Mvc;

namespace TeamFinder.API.Controllers;

public class BaseController : ControllerBase
{
    protected Guid CurrentProfileId => 
        Guid.TryParse(User.FindFirst("profile:id")?.Value, out var id) ? id : Guid.Empty;
}