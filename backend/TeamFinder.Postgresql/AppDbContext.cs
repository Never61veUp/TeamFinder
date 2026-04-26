using Microsoft.EntityFrameworkCore;
using TeamFinder.Postgresql.Configuration;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Postgresql;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<ProfileEntity> Profiles => Set<ProfileEntity>();
    public DbSet<SkillEntity> Skills => Set<SkillEntity>();
    public DbSet<SkillClosure> SkillClosures => Set<SkillClosure>();
    public DbSet<ProfileSkillEntity> ProfileSkillEntity => Set<ProfileSkillEntity>();
    public DbSet<TeamEntity> Teams => Set<TeamEntity>();
    public DbSet<TeamMemberEntity> TeamMembers => Set<TeamMemberEntity>();
    public DbSet<WantedProfileEntity> WantedProfiles => Set<WantedProfileEntity>();
    public DbSet<WantedProfileSkillEntity> WantedProfileSkills => Set<WantedProfileSkillEntity>();
    public DbSet<InvitationEntity> Invitations => Set<InvitationEntity>();
    public DbSet<JoinRequestEntity> JoinRequests => Set<JoinRequestEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new SkillConfiguration());
        modelBuilder.ApplyConfiguration(new SkillClosureConfiguration());
        modelBuilder.ApplyConfiguration(new ProfileConfiguration());
        modelBuilder.ApplyConfiguration(new UserSkillConfiguration());
        modelBuilder.ApplyConfiguration(new TeamConfiguration());
        modelBuilder.ApplyConfiguration(new JoinRequestConfiguration());

        modelBuilder.Entity<TeamMemberEntity>()
            .HasKey(k => new { k.TeamId, k.ProfileId });

        modelBuilder.Entity<WantedProfileSkillEntity>()
            .HasKey(k => k.Id);

        modelBuilder.Entity<WantedProfileEntity>()
            .HasKey(k => k.Id);
    }
}