using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Postgresql.Configuration;

public class SkillConfiguration : IEntityTypeConfiguration<SkillEntity>
{
    public void Configure(EntityTypeBuilder<SkillEntity> builder)
    {
        builder.ToTable("skills");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(x => x.Name)
            .IsUnique();
        
        builder.HasMany<ProfileSkillEntity>()
            .WithOne(x => x.Skill)
            .HasForeignKey(x => x.SkillId);
    }
}