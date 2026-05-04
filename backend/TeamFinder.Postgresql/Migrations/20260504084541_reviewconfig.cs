using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeamFinder.Postgresql.Migrations
{
    /// <inheritdoc />
    public partial class reviewconfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Reviews",
                table: "Reviews");

            migrationBuilder.RenameTable(
                name: "Reviews",
                newName: "reviews");

            migrationBuilder.AddPrimaryKey(
                name: "PK_reviews",
                table: "reviews",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_reviews_ReviewerId_TargetId",
                table: "reviews",
                columns: new[] { "ReviewerId", "TargetId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_reviews",
                table: "reviews");

            migrationBuilder.DropIndex(
                name: "IX_reviews_ReviewerId_TargetId",
                table: "reviews");

            migrationBuilder.RenameTable(
                name: "reviews",
                newName: "Reviews");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Reviews",
                table: "Reviews",
                column: "Id");
        }
    }
}
