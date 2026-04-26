using System.ComponentModel.DataAnnotations;

namespace TeamFinder.API.Options;

public record TelegramOptions
{
    public const string SectionName = "Telegram";
    [Required] public string BotToken { get; set; } = string.Empty;
}