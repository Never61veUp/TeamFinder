using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeamFinder.Postgresql.Migrations
{
    /// <inheritdoc />
    public partial class profiledescription : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "profiles",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "profiles");
        }
    }
}
