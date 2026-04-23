using System.Reflection;
using TeamFinder.Core.Model.Teams;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Application.Mapping;

public static class TeamMapping
{
    public static Team MapToDomain(this TeamEntity e)
    {
        var wanted = e.WantedProfiles.Select(wp =>
        {
            var w = new WantedProfile();
            var field = typeof(WantedProfile)
                .GetField("<RequiredSkills>k__BackingField", BindingFlags.Instance | BindingFlags.NonPublic);
            field?.SetValue(w, wp.RequiredSkills.Select(s => s.SkillId).ToList());
            return w;
        }).ToList();
        
        var invitations = e.Invitations.Select(inv =>
        {
            var invObj = (Invitation)Activator.CreateInstance(
                typeof(Invitation), true)!;

            typeof(Invitation).GetProperty("Id", BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic)
                ?.SetValue(invObj, inv.Id);
            typeof(Invitation)
                .GetProperty("InviteeId", BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic)
                ?.SetValue(invObj, inv.InviteeId);
            typeof(Invitation)
                .GetProperty("InvitedBy", BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic)
                ?.SetValue(invObj, inv.InvitedBy);

            var statusProp = typeof(Invitation).GetProperty("Status",
                BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);
            if (statusProp != null && Enum.TryParse(typeof(InvitationStatus), inv.Status, out var st))
                statusProp.SetValue(invObj, st);

            return invObj;
        }).ToList();
        
        var members = e.Members.Select(m => m.ProfileId).ToList();
        
        var reconstruct = typeof(Team)
            .GetMethod("Reconstruct", BindingFlags.Static | BindingFlags.NonPublic | BindingFlags.Public);

        var domain = (Team)reconstruct.Invoke(null, new object[]
        {
            e.Id,
            e.OwnerId,
            e.Name,
            e.MaxMembers,
            members,
            wanted,
            new List<Guid>(),
            invitations
        });

        return domain;
    }

    public static TeamEntity MapToEntity(this Team t)
    {
        var teamEntity = new TeamEntity
        {
            Id = t.Id,
            Name = t.Name,
            OwnerId = t.OwnerId,
            MaxMembers = t.MaxMembers,
            Members = t.Members.Select(m => new TeamMemberEntity { TeamId = t.Id, ProfileId = m }).ToList(),
            WantedProfiles = t.WantedProfiles.Select(wp => new WantedProfileEntity
            {
                TeamId = t.Id,
                RequiredSkills = wp.RequiredSkills.Select(s => new WantedProfileSkillEntity { SkillId = s }).ToList()
            }).ToList(),
            Invitations = t.Invitations.Select(inv => new InvitationEntity
            {
                Id = inv.Id,
                InviteeId = inv.InviteeId,
                InvitedBy = inv.InvitedBy,
                Status = inv.Status.ToString()
            }).ToList()
        };

        return teamEntity;
    }
}