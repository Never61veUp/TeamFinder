using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Postgresql.Configuration;

public class SkillClosureConfiguration : IEntityTypeConfiguration<SkillClosure>
{
    public void Configure(EntityTypeBuilder<SkillClosure> builder)
    {
        builder.ToTable("skill_closure");

        builder.HasKey(x => new { x.AncestorId, x.DescendantId });

        builder.Property(x => x.Depth)
            .IsRequired();

        builder.HasOne(x => x.Ancestor)
            .WithMany()
            .HasForeignKey(x => x.AncestorId)
            .OnDelete(DeleteBehavior.Restrict);
        ;

        builder.HasOne(x => x.Descendant)
            .WithMany()
            .HasForeignKey(x => x.DescendantId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => x.AncestorId);
        builder.HasIndex(x => x.DescendantId);
    }
}