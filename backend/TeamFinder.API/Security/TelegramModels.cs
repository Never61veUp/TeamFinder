namespace TeamFinder.API.Security;

public sealed record TelegramAuthRequest(string InitData);

public sealed record TelegramAuthResponse(string Token, TelegramWebAppUser User);

public sealed record TelegramWebAppUser(
    long TgId,
    string? Username,
    string? FirstName,
    string? LastName,
    string? LanguageCode,
    bool? IsPremium);

public sealed record TelegramValidationResult(bool IsValid, TelegramWebAppUser? User, string? Error);