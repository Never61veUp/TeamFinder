using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.WebUtilities;

namespace TeamFinder.API.Security;

public sealed class TelegramWebAppValidator
{
    private static readonly TimeSpan MaxAge = TimeSpan.FromHours(24);

    public TelegramValidationResult ValidateInitData(string? initData, string botToken)
    {
        if (string.IsNullOrWhiteSpace(initData))
            return new TelegramValidationResult(false, null, "initData_missing");

        Dictionary<string, string> kv;
        try
        {
            kv = ParseQueryString(initData);
        }
        catch
        {
            return new TelegramValidationResult(false, null, "initData_parse_failed");
        }

        if (!kv.TryGetValue("hash", out var hash) || string.IsNullOrWhiteSpace(hash))
            return new TelegramValidationResult(false, null, "hash_missing");

        if (!IsSignatureValid(kv, hash, botToken))
            return new TelegramValidationResult(false, null, "signature_invalid");

        if (!kv.TryGetValue("auth_date", out var authDateRaw) ||
            !long.TryParse(authDateRaw, NumberStyles.Integer, CultureInfo.InvariantCulture, out var authDateUnix))
            return new TelegramValidationResult(false, null, "auth_date_invalid");

        var authDate = DateTimeOffset.FromUnixTimeSeconds(authDateUnix);
        if (DateTimeOffset.UtcNow - authDate > MaxAge)
            return new TelegramValidationResult(false, null, "auth_date_expired");

        if (!kv.TryGetValue("user", out var userJson) || string.IsNullOrWhiteSpace(userJson))
            return new TelegramValidationResult(false, null, "user_missing");

        TelegramWebAppUser? user;
        try
        {
            using var doc = JsonDocument.Parse(userJson);
            var root = doc.RootElement;

            if (!root.TryGetProperty("id", out var idProp) || !idProp.TryGetInt64(out var id))
                return new TelegramValidationResult(false, null, "user_id_missing");

            user = new TelegramWebAppUser(
                id,
                root.TryGetProperty("username", out var u) ? u.GetString() : null,
                root.TryGetProperty("first_name", out var fn) ? fn.GetString() : null,
                root.TryGetProperty("last_name", out var ln) ? ln.GetString() : null,
                root.TryGetProperty("language_code", out var lc) ? lc.GetString() : null,
                root.TryGetProperty("is_premium", out var ip) ? ip.GetBoolean() : null
            );
        }
        catch
        {
            return new TelegramValidationResult(false, null, "user_parse_failed");
        }

        return new TelegramValidationResult(true, user, null);
    }

    private static bool IsSignatureValid(Dictionary<string, string> kv, string providedHashHex, string botToken)
    {
        var dataCheckString = BuildDataCheckString(kv);

        byte[] secretKey;
        using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes("WebAppData")))
        {
            secretKey = hmac.ComputeHash(Encoding.UTF8.GetBytes(botToken));
        }

        byte[] actual;
        using (var hmac = new HMACSHA256(secretKey))
        {
            actual = hmac.ComputeHash(Encoding.UTF8.GetBytes(dataCheckString));
        }

        var actualHex = Convert.ToHexString(actual).ToLowerInvariant();
        return FixedTimeEqualsHex(actualHex, providedHashHex.Trim().ToLowerInvariant());
    }

    private static string BuildDataCheckString(Dictionary<string, string> kv)
    {
        var pairs = kv
            .Where(p => !string.Equals(p.Key, "hash", StringComparison.Ordinal))
            .OrderBy(p => p.Key, StringComparer.Ordinal)
            .Select(p => $"{p.Key}={p.Value}");

        return string.Join("\n", pairs);
    }

    private static bool FixedTimeEqualsHex(string a, string b)
    {
        if (a.Length != b.Length)
            return false;

        var diff = 0;
        for (var i = 0; i < a.Length; i++)
            diff |= a[i] ^ b[i];
        return diff == 0;
    }

    private static Dictionary<string, string> ParseQueryString(string query)
    {
        query = query.TrimStart('?');

        var parsed = QueryHelpers.ParseQuery(query);
        var result = new Dictionary<string, string>(StringComparer.Ordinal);
        foreach (var (key, values) in parsed)
            result[key] = values.Count > 0 ? values[0] ?? string.Empty : string.Empty;

        return result;
    }
}