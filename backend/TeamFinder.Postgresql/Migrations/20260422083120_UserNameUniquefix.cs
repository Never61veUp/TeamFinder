using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeamFinder.Postgresql.Migrations
{
    /// <inheritdoc />
    public partial class UserNameUniquefix : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_profiles_UserName",
                table: "profiles");

            migrationBuilder.CreateIndex(
                name: "IX_profiles_UserName",
                table: "profiles",
                column: "UserName");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_profiles_UserName",
                table: "profiles");

            migrationBuilder.CreateIndex(
                name: "IX_profiles_UserName",
                table: "profiles",
                column: "UserName",
                unique: true);
        }
    }
}
