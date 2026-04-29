using System.Text.Json.Serialization;
using TeamFinder.Core.Model.Teams;

namespace TeamFinder.Contracts;

public record CreateTeamRequest(string TeamName, int MaxMembers, string? Description, string? EventName, DateOnly? EventStart, DateOnly? EventEnd, List<Tag> Tags);

