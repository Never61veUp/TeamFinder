using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Postgresql.Configuration;

public class JoinRequestConfiguration : IEntityTypeConfiguration<JoinRequestEntity>
{
    public void Configure(EntityTypeBuilder<JoinRequestEntity> builder)
    {
        builder.HasKey(jr => new { jr.TeamId, jr.ProfileId });
        
        builder.HasOne<TeamEntity>()
            .WithMany(t => t.JoinRequests)
            .HasForeignKey(jr => jr.TeamId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}