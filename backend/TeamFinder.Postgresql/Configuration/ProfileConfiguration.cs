using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Postgresql.Configuration;

public class ProfileConfiguration : IEntityTypeConfiguration<ProfileEntity>
{
    public void Configure(EntityTypeBuilder<ProfileEntity> builder)
    {
        builder.ToTable("profiles");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.UserName)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(x => x.UserName);

        builder.HasMany(x => x.Skills)
            .WithOne(x => x.Profile)
            .HasForeignKey(x => x.ProfileId);
    }
}