using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeamFinder.Postgresql.Migrations
{
    /// <inheritdoc />
    public partial class removegraph : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProfileSkills_Profiles_ProfileId",
                table: "ProfileSkills");

            migrationBuilder.DropForeignKey(
                name: "FK_ProfileSkills_Skills_SkillId",
                table: "ProfileSkills");

            migrationBuilder.DropTable(
                name: "SkillRelations");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Skills",
                table: "Skills");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Profiles",
                table: "Profiles");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProfileSkills",
                table: "ProfileSkills");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Profiles");

            migrationBuilder.RenameTable(
                name: "Skills",
                newName: "skills");

            migrationBuilder.RenameTable(
                name: "Profiles",
                newName: "profiles");

            migrationBuilder.RenameTable(
                name: "ProfileSkills",
                newName: "user_skills");

            migrationBuilder.RenameIndex(
                name: "IX_Skills_Name",
                table: "skills",
                newName: "IX_skills_Name");

            migrationBuilder.RenameColumn(
                name: "ProfileId",
                table: "user_skills",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_ProfileSkills_SkillId",
                table: "user_skills",
                newName: "IX_user_skills_SkillId");

            migrationBuilder.AddColumn<string>(
                name: "UserName",
                table: "profiles",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_skills",
                table: "skills",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_profiles",
                table: "profiles",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_user_skills",
                table: "user_skills",
                columns: new[] { "UserId", "SkillId" });

            migrationBuilder.CreateTable(
                name: "skill_closure",
                columns: table => new
                {
                    AncestorId = table.Column<Guid>(type: "uuid", nullable: false),
                    DescendantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Depth = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_skill_closure", x => new { x.AncestorId, x.DescendantId });
                    table.ForeignKey(
                        name: "FK_skill_closure_skills_AncestorId",
                        column: x => x.AncestorId,
                        principalTable: "skills",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_skill_closure_skills_DescendantId",
                        column: x => x.DescendantId,
                        principalTable: "skills",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_profiles_UserName",
                table: "profiles",
                column: "UserName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_user_skills_UserId",
                table: "user_skills",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_skill_closure_AncestorId",
                table: "skill_closure",
                column: "AncestorId");

            migrationBuilder.CreateIndex(
                name: "IX_skill_closure_DescendantId",
                table: "skill_closure",
                column: "DescendantId");

            migrationBuilder.AddForeignKey(
                name: "FK_user_skills_profiles_UserId",
                table: "user_skills",
                column: "UserId",
                principalTable: "profiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_user_skills_skills_SkillId",
                table: "user_skills",
                column: "SkillId",
                principalTable: "skills",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_user_skills_profiles_UserId",
                table: "user_skills");

            migrationBuilder.DropForeignKey(
                name: "FK_user_skills_skills_SkillId",
                table: "user_skills");

            migrationBuilder.DropTable(
                name: "skill_closure");

            migrationBuilder.DropPrimaryKey(
                name: "PK_skills",
                table: "skills");

            migrationBuilder.DropPrimaryKey(
                name: "PK_profiles",
                table: "profiles");

            migrationBuilder.DropIndex(
                name: "IX_profiles_UserName",
                table: "profiles");

            migrationBuilder.DropPrimaryKey(
                name: "PK_user_skills",
                table: "user_skills");

            migrationBuilder.DropIndex(
                name: "IX_user_skills_UserId",
                table: "user_skills");

            migrationBuilder.DropColumn(
                name: "UserName",
                table: "profiles");

            migrationBuilder.RenameTable(
                name: "skills",
                newName: "Skills");

            migrationBuilder.RenameTable(
                name: "profiles",
                newName: "Profiles");

            migrationBuilder.RenameTable(
                name: "user_skills",
                newName: "ProfileSkills");

            migrationBuilder.RenameIndex(
                name: "IX_skills_Name",
                table: "Skills",
                newName: "IX_Skills_Name");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "ProfileSkills",
                newName: "ProfileId");

            migrationBuilder.RenameIndex(
                name: "IX_user_skills_SkillId",
                table: "ProfileSkills",
                newName: "IX_ProfileSkills_SkillId");

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Profiles",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Skills",
                table: "Skills",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Profiles",
                table: "Profiles",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProfileSkills",
                table: "ProfileSkills",
                columns: new[] { "ProfileId", "SkillId" });

            migrationBuilder.CreateTable(
                name: "SkillRelations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ChildSkillId = table.Column<Guid>(type: "uuid", nullable: false),
                    ParentSkillId = table.Column<Guid>(type: "uuid", nullable: false),
                    Weight = table.Column<double>(type: "double precision", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SkillRelations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SkillRelations_Skills_ChildSkillId",
                        column: x => x.ChildSkillId,
                        principalTable: "Skills",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SkillRelations_Skills_ParentSkillId",
                        column: x => x.ParentSkillId,
                        principalTable: "Skills",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SkillRelations_ChildSkillId",
                table: "SkillRelations",
                column: "ChildSkillId");

            migrationBuilder.CreateIndex(
                name: "IX_SkillRelations_ParentSkillId",
                table: "SkillRelations",
                column: "ParentSkillId");

            migrationBuilder.CreateIndex(
                name: "IX_SkillRelations_ParentSkillId_ChildSkillId",
                table: "SkillRelations",
                columns: new[] { "ParentSkillId", "ChildSkillId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_ProfileSkills_Profiles_ProfileId",
                table: "ProfileSkills",
                column: "ProfileId",
                principalTable: "Profiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProfileSkills_Skills_SkillId",
                table: "ProfileSkills",
                column: "SkillId",
                principalTable: "Skills",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
