using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeamFinder.Postgresql.Migrations
{
    /// <inheritdoc />
    public partial class githubentity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "GithubInfoId",
                table: "profiles",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "GithubEntity",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    GithubId = table.Column<string>(type: "text", nullable: false),
                    Username = table.Column<string>(type: "text", nullable: false),
                    ProfileUrl = table.Column<string>(type: "text", nullable: false),
                    RepositoriesCount = table.Column<int>(type: "integer", nullable: false),
                    TotalStars = table.Column<int>(type: "integer", nullable: false),
                    TopLanguage = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GithubEntity", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_profiles_GithubInfoId",
                table: "profiles",
                column: "GithubInfoId");

            migrationBuilder.AddForeignKey(
                name: "FK_profiles_GithubEntity_GithubInfoId",
                table: "profiles",
                column: "GithubInfoId",
                principalTable: "GithubEntity",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_profiles_GithubEntity_GithubInfoId",
                table: "profiles");

            migrationBuilder.DropTable(
                name: "GithubEntity");

            migrationBuilder.DropIndex(
                name: "IX_profiles_GithubInfoId",
                table: "profiles");

            migrationBuilder.DropColumn(
                name: "GithubInfoId",
                table: "profiles");
        }
    }
}
