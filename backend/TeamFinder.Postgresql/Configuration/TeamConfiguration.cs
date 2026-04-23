using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Postgresql.Configuration;

public class TeamConfiguration : IEntityTypeConfiguration<TeamEntity>
{
    public void Configure(EntityTypeBuilder<TeamEntity> builder)
    {
        builder.ToTable("teams");
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Name).IsRequired();
        builder.Property(t => t.OwnerId).IsRequired();
        builder.Property(t => t.MaxMembers).IsRequired();

        builder.HasMany(t => t.Members)
            .WithOne(m => m.Team)
            .HasForeignKey(m => m.TeamId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(t => t.WantedProfiles)
            .WithOne(w => w.Team)
            .HasForeignKey(w => w.TeamId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(t => t.Invitations)
            .WithOne(i => i.Team)
            .HasForeignKey(i => i.TeamId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}