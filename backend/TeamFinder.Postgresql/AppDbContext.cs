using Microsoft.EntityFrameworkCore;
using TeamFinder.Core.Model;
using TeamFinder.Postgresql.Configuration;
using TeamFinder.Postgresql.Model;
using Profile = TeamFinder.Core.Model.Profile;

namespace TeamFinder.Postgresql;

public class AppDbContext : DbContext
{
    public DbSet<ProfileEntity> Profiles => Set<ProfileEntity>();
    public DbSet<SkillEntity> Skills => Set<SkillEntity>();
    public DbSet<SkillClosure> SkillClosures => Set<SkillClosure>();
    public DbSet<ProfileSkillEntity> ProfileSkillEntity => Set<ProfileSkillEntity>();


    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfiguration(new SkillConfiguration());
        modelBuilder.ApplyConfiguration(new SkillClosureConfiguration());
        modelBuilder.ApplyConfiguration(new ProfileConfiguration());
        modelBuilder.ApplyConfiguration(new UserSkillConfiguration());

    }
}