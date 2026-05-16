using System.Text;
using System.Web;

namespace TeamFinder.Application.Services;

public interface ITelegramNotificationTemplate
{
    string CreateTeamInvitationMessage(string teamName, string? inviterName);
    string CreateReviewReceivedMessage(double rating, string reviewText);
    string CreateNewJoinRequestMessage(string teamName);
    string CreateJoinRequestAcceptedMessage(string teamName);
    string CreateTeamDisbandedMessage(string teamName);
    string CreateKickedFromTeamMessage(string teamName);
}

public class TelegramNotificationTemplate : ITelegramNotificationTemplate
{
    public string CreateTeamInvitationMessage(string teamName, string? inviterName)
    {
        return new StringBuilder()
            .AppendLine("<b>🔔 Новое приглашение в команду!</b>")
            .AppendLine()
            .AppendLine($"{HttpUtility.HtmlEncode(inviterName ?? "Участник")} приглашает вас в проект <b>\"{HttpUtility.HtmlEncode(teamName)}\"</b>.")
            .AppendLine()
            .AppendLine("<i>Нажмите кнопку ниже, чтобы посмотреть детали.</i>")
            .ToString();
    }

    public string CreateReviewReceivedMessage(double rating, string reviewText)
    {
        return new StringBuilder()
            .AppendLine("<b>⭐ Получен новый отзыв!</b>")
            .AppendLine($"<b>Оценка:</b> {rating} / 5.0")
            .AppendLine()
            .AppendLine($"<blockquote>\"{HttpUtility.HtmlEncode(reviewText)}\"</blockquote>")
            .ToString();
    }
    
    public string CreateNewJoinRequestMessage(string teamName)
    {
        return new StringBuilder()
            .AppendLine("<b>📩 Новая заявка в команду!</b>")
            .AppendLine("— — — — — — — — — — — — —")
            .AppendLine($"Пользователь хочет вступить в вашу команду <b>\"{HttpUtility.HtmlEncode(teamName)}\"</b>.")
            .AppendLine()
            .AppendLine("<i>Откройте приложение, чтобы посмотреть профиль кандидата и принять решение.</i>")
            .ToString();
    }
    
    public string CreateJoinRequestAcceptedMessage(string teamName)
    {
        return new StringBuilder()
            .AppendLine("<b>🎉 Ура! Заявка одобрена</b>")
            .AppendLine("— — — — — — — — — — — — —")
            .AppendLine($"Вы успешно приняты в команду <b>\"{HttpUtility.HtmlEncode(teamName)}\"</b>!")
            .AppendLine()
            .AppendLine("🚀 <i>Самое время познакомиться с остальными участниками в чате команды.</i>")
            .ToString();
    }
    
    public string CreateTeamDisbandedMessage(string teamName)
    {
        return new StringBuilder()
            .AppendLine("<b>⚠️ Команда расформирована</b>")
            .AppendLine("— — — — — — — — — — — — —")
            .AppendLine($"Владелец удалил команду <b>\"{HttpUtility.HtmlEncode(teamName)}\"</b>.")
            .AppendLine()
            .AppendLine("<i>Не расстраивайтесь! В ленте поиска всё еще много крутых хакатонов и проектов, ждущих вас.</i>")
            .ToString();
    }
    
    public string CreateKickedFromTeamMessage(string teamName)
    {
        return new StringBuilder()
            .AppendLine("<b>🚪 Исключение из команды</b>")
            .AppendLine("— — — — — — — — — — — — —")
            .AppendLine($"Вы были исключены из состава команды <b>\"{HttpUtility.HtmlEncode(teamName)}\"</b>.")
            .AppendLine()
            .AppendLine("<i>Вы можете продолжить поиск других команд или создать свою собственную.</i>")
            .ToString();
    }
}