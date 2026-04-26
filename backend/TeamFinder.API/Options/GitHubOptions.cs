using System.ComponentModel.DataAnnotations;

namespace TeamFinder.API.Options;

public record GitHubOptions
{
    public const string SectionName = "GitHub";
    [Required]
    public string ClientId { get; set; } = string.Empty;
    [Required]
    public string ClientSecret { get; set; } = string.Empty;
}