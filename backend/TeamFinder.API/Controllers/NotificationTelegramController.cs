using Microsoft.AspNetCore.Mvc;
using TeamFinder.Application.Services;

namespace TeamFinder.API.Controllers;

[ApiController]
[Route("api/telegramNotification")]
public class NotificationTelegramController : BaseController
{
    private readonly ITelegramNotificationService _service;

    public NotificationTelegramController(ITelegramNotificationService service)
    {
        _service = service;
    }
    
    [HttpPost]
    public async Task<IActionResult> SendNotification([FromBody]TelegramNotificationRequest request)
    {
        await _service.SendTextNotificationAsync(request.UserId, request.Text);
        return Ok();
    }
}

public record TelegramNotificationRequest(string Text, int UserId);