using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeamFinder.Postgresql.Migrations
{
    /// <inheritdoc />
    public partial class changeIndexForReview : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_reviews_ReviewerId_TargetId",
                table: "reviews");

            migrationBuilder.CreateIndex(
                name: "IX_reviews_TeamId_TargetId_ReviewerId",
                table: "reviews",
                columns: new[] { "TeamId", "TargetId", "ReviewerId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_reviews_TeamId_TargetId_ReviewerId",
                table: "reviews");

            migrationBuilder.CreateIndex(
                name: "IX_reviews_ReviewerId_TargetId",
                table: "reviews",
                columns: new[] { "ReviewerId", "TargetId" },
                unique: true);
        }
    }
}
