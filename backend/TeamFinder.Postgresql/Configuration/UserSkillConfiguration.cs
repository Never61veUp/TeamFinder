using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Postgresql.Configuration;

public class UserSkillConfiguration : IEntityTypeConfiguration<ProfileSkillEntity>
{
    public void Configure(EntityTypeBuilder<ProfileSkillEntity> builder)
    {
        builder.ToTable("user_skills");
        
        builder.HasKey(x => new { x.ProfileId, x.SkillId });

        builder.Property(x => x.Level)
            .HasDefaultValue(1);

        builder.HasOne(x => x.Profile)
            .WithMany(x => x.Skills)
            .HasForeignKey(x => x.ProfileId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Skill)
            .WithMany()
            .HasForeignKey(x => x.SkillId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.SkillId);
        builder.HasIndex(x => x.ProfileId);
    }
}