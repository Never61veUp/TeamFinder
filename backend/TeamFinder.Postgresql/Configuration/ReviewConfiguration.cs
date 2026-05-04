using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Postgresql.Configuration;

public class ReviewConfiguration : IEntityTypeConfiguration<ReviewEntity>
{
    public void Configure(EntityTypeBuilder<ReviewEntity> builder)
    {
        builder.ToTable("reviews");
        
        builder.HasKey(x => x.Id);
        
        builder.HasIndex(r => new { r.ReviewerId, r.TargetId })
            .IsUnique();
    }
}