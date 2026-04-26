using System.Reflection;
using CSharpFunctionalExtensions;
using TeamFinder.Core.Model.Teams;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Application.Mapping;

public static class TeamMapping
{
    public static Result<Team> MapToDomain(this TeamEntity e)
    {
        var wantedProfiles = e.WantedProfiles
            .Select(wp => WantedProfile.Create(wp.Id, wp.RequiredSkills.Select(s => s.SkillId).ToList()).Value)
            .ToList();
        
        var invitations = e.Invitations.Select(inv => 
            inv.MapToDomain()).ToList();
        
        var joinRequests = e.JoinRequests.Select(jr => new JoinRequest(jr.TeamId, jr.ProfileId)).ToList();
        var members = e.Members.Select(m => m.ProfileId).ToList();
        
        return Team.Restore(
            e.Id, 
            e.OwnerId, 
            members, 
            e.Name, 
            e.MaxMembers, 
            wantedProfiles, 
            invitations, 
            joinRequests);
    }

    public static TeamEntity MapToEntity(this Team t)
    {
        return new TeamEntity
        {
            Id = t.Id,
            Name = t.Name,
            OwnerId = t.OwnerId,
            MaxMembers = t.MaxMembers,
            
            Members = t.Members.Select(m => new TeamMemberEntity { TeamId = t.Id, ProfileId = m }).ToList(),
            JoinRequests = t.JoinRequests.Select(jr => new JoinRequestEntity { TeamId = t.Id, ProfileId = jr.ProfileId }).ToList(),
            WantedProfiles = t.WantedProfiles.Select(wp => new WantedProfileEntity
            {
                Id = wp.Id,
                TeamId = t.Id,
                RequiredSkills = wp.RequiredSkills.Select(s => new WantedProfileSkillEntity { SkillId = s }).ToList()
            }).ToList(),
            Invitations = t.Invitations.Select(inv => inv.MapToEntity()).ToList()
        };
    }
}