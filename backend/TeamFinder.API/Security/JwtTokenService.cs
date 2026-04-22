using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace TeamFinder.API.Security;

public sealed class JwtTokenService
{
    public string CreateToken(Guid profileId, TelegramWebAppUser user, IConfiguration config)
    {
        var issuer = config["JWT_ISSUER"] ?? "MiniApp";
        var audience = config["JWT_AUDIENCE"] ?? "MiniApp";
        var key = config["JWT_KEY"];
        if (string.IsNullOrWhiteSpace(key))
            throw new InvalidOperationException("Missing JWT signing key. Set environment variable JWT_KEY.");

        var creds = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new("tg:id", user.TgId.ToString()),
        };

        if (!string.IsNullOrWhiteSpace(user.Username)) claims.Add(new Claim("tg:username", user.Username));
        if (!string.IsNullOrWhiteSpace(user.FirstName)) claims.Add(new Claim("tg:first_name", user.FirstName));
        if (!string.IsNullOrWhiteSpace(user.LastName)) claims.Add(new Claim("tg:last_name", user.LastName));
        claims.Add(new Claim("profile:id", profileId.ToString()));

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            notBefore: DateTime.UtcNow.AddSeconds(-5),
            expires: DateTime.UtcNow.AddHours(12),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

