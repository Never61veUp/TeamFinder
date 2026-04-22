using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeamFinder.Postgresql.Migrations
{
    /// <inheritdoc />
    public partial class dbeasy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_skill_closure_skills_AncestorId",
                table: "skill_closure");

            migrationBuilder.DropForeignKey(
                name: "FK_skill_closure_skills_DescendantId",
                table: "skill_closure");

            migrationBuilder.DropForeignKey(
                name: "FK_user_skills_profiles_UserId",
                table: "user_skills");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "user_skills",
                newName: "ProfileId");

            migrationBuilder.RenameIndex(
                name: "IX_user_skills_UserId",
                table: "user_skills",
                newName: "IX_user_skills_ProfileId");

            migrationBuilder.AddForeignKey(
                name: "FK_skill_closure_skills_AncestorId",
                table: "skill_closure",
                column: "AncestorId",
                principalTable: "skills",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_skill_closure_skills_DescendantId",
                table: "skill_closure",
                column: "DescendantId",
                principalTable: "skills",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_user_skills_profiles_ProfileId",
                table: "user_skills",
                column: "ProfileId",
                principalTable: "profiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_skill_closure_skills_AncestorId",
                table: "skill_closure");

            migrationBuilder.DropForeignKey(
                name: "FK_skill_closure_skills_DescendantId",
                table: "skill_closure");

            migrationBuilder.DropForeignKey(
                name: "FK_user_skills_profiles_ProfileId",
                table: "user_skills");

            migrationBuilder.RenameColumn(
                name: "ProfileId",
                table: "user_skills",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_user_skills_ProfileId",
                table: "user_skills",
                newName: "IX_user_skills_UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_skill_closure_skills_AncestorId",
                table: "skill_closure",
                column: "AncestorId",
                principalTable: "skills",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_skill_closure_skills_DescendantId",
                table: "skill_closure",
                column: "DescendantId",
                principalTable: "skills",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_user_skills_profiles_UserId",
                table: "user_skills",
                column: "UserId",
                principalTable: "profiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
