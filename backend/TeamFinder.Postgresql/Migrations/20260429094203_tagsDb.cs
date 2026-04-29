using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeamFinder.Postgresql.Migrations
{
    /// <inheritdoc />
    public partial class tagsDb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int[]>(
                name: "EventTags",
                table: "teams",
                type: "integer[]",
                nullable: false,
                defaultValue: new int[0]);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EventTags",
                table: "teams");
        }
    }
}
