using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TeamFinder.Application.Options;
using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.ReplyMarkups;

namespace TeamFinder.Application.Services;

public interface ITelegramNotificationService
{
    Task SendTextNotificationAsync(long userId, string message);
}

public class TelegramNotificationService : ITelegramNotificationService
{
    private readonly ILogger<TelegramNotificationService> _logger;
    private readonly TelegramBotClient _botClient;

    public TelegramNotificationService(IOptions<TelegramOptions> options, ILogger<TelegramNotificationService> logger)
    {
        var token = options.Value.BotToken;
        _botClient = new TelegramBotClient(token);
        _logger = logger;
    }
    
    public async Task SendTextNotificationAsync(long userId, string message)
    {
        try
        {
            var inlineKeyboard = new InlineKeyboardMarkup([
                [
                    InlineKeyboardButton.WithWebApp(
                        text: "Открыть",
                        webApp: new WebAppInfo { Url = "https://teamfinder.mixdev.me/" }
                    )
                ]
            ]);
            
            await _botClient.SendMessage(
                chatId: userId,
                text: message,
                replyMarkup: inlineKeyboard
            );
            
            _logger.Log(LogLevel.Information, "Telegram notification sent to {UserId}", userId);
        }
        catch (Exception ex)
        {
            _logger.Log(LogLevel.Error, ex, "Telegram notification failed");
        }
    }
}