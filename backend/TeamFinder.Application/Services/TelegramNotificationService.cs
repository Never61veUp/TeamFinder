using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TeamFinder.Application.Options;
using Telegram.Bot;
using Telegram.Bot.Types;
using Telegram.Bot.Types.ReplyMarkups;

namespace TeamFinder.Application.Services;

public interface ITelegramSender
{
    Task SendTextMessageAsync(long userId, string message, string additionalUrl = "");
}

public class TelegramSender : ITelegramSender
{
    private readonly ILogger<TelegramSender> _logger;
    private readonly TelegramBotClient _botClient;

    public TelegramSender(IOptions<TelegramOptions> options, ILogger<TelegramSender> logger)
    {
        var token = options.Value.BotToken;
        _botClient = new TelegramBotClient(token);
        _logger = logger;
    }
    
    public async Task SendTextMessageAsync(long userId, string message, string additionalUrl = "")
    {
        const string baseUrl = "https://teamfinder.mixdev.me";
        var cleanAdditionalUrl = additionalUrl.TrimStart('/');

        var url = string.IsNullOrEmpty(cleanAdditionalUrl) 
            ? baseUrl 
            : $"{baseUrl}/{cleanAdditionalUrl}";
        
        try
        {
            var inlineKeyboard = new InlineKeyboardMarkup([
                [
                    InlineKeyboardButton.WithWebApp(
                        text: "Открыть",
                        webApp: new WebAppInfo { Url = url }
                    )
                ]
            ]);
            
            await _botClient.SendMessage(
                chatId: userId,
                text: message,
                parseMode: Telegram.Bot.Types.Enums.ParseMode.Html,
                replyMarkup: inlineKeyboard
            );
            
            _logger.Log(LogLevel.Information, "Telegram notification sent to {UserId}", userId);
        }
        catch (Exception ex)
        {
            _logger.Log(LogLevel.Error, ex, "Telegram notification failed for user {UserId}", userId);
        }
    }
}