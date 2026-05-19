using System.ComponentModel.DataAnnotations;

namespace TeamFinder.Application.Options;

public record TelegramOptions
{
    public const string SectionName = "Telegram";
    [Required] public string BotToken { get; set; } = string.Empty;
}