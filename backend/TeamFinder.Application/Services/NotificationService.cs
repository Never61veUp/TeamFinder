using TeamFinder.Postgresql.Abstractions;

namespace TeamFinder.Application.Services;

public interface INotificationService
{
    Task NotifyProfileAsync(Guid profileId, string text, string additionalUrl = "");
}

public class NotificationService : INotificationService
{
    private readonly ITelegramSender _sender;
    private readonly IProfileRepository _profileRepository;

    public NotificationService(ITelegramSender sender, IProfileRepository profileRepository)
    {
        _sender = sender;
        _profileRepository = profileRepository;
    }
    
    public async Task NotifyProfileAsync(Guid profileId, string text, string additionalUrl = "")
    {
        var tgIdResult = await _profileRepository
            .GetTgIdByProfileId(profileId);

        if (tgIdResult.IsSuccess)
        {
            await _sender.SendTextMessageAsync(
                tgIdResult.Value,
                text,
                additionalUrl);
        }
    }
}