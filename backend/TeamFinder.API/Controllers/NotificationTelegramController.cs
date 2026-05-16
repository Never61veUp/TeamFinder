using Microsoft.AspNetCore.Mvc;
using TeamFinder.Application.Services;

namespace TeamFinder.API.Controllers;

[ApiController]
[Route("api/telegramNotification")]
public class NotificationTelegramController : BaseController
{
    private readonly ITelegramSender _service;

    public NotificationTelegramController(ITelegramSender service)
    {
        _service = service;
    }
    
    [HttpPost]
    public async Task<IActionResult> SendNotification([FromBody]TelegramNotificationRequest request)
    {
        await _service.SendTextMessageAsync(request.UserId, request.Text);
        return Ok();
    }
}

public record TelegramNotificationRequest(string Text, int UserId);