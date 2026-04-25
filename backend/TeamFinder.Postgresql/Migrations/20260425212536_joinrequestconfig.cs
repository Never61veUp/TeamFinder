using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeamFinder.Postgresql.Migrations
{
    /// <inheritdoc />
    public partial class joinrequestconfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JoinRequests_teams_TeamEntityId",
                table: "JoinRequests");

            migrationBuilder.DropPrimaryKey(
                name: "PK_JoinRequests",
                table: "JoinRequests");

            migrationBuilder.DropIndex(
                name: "IX_JoinRequests_TeamEntityId",
                table: "JoinRequests");

            migrationBuilder.DropColumn(
                name: "TeamEntityId",
                table: "JoinRequests");

            migrationBuilder.AddPrimaryKey(
                name: "PK_JoinRequests",
                table: "JoinRequests",
                columns: new[] { "TeamId", "ProfileId" });

            migrationBuilder.AddForeignKey(
                name: "FK_JoinRequests_teams_TeamId",
                table: "JoinRequests",
                column: "TeamId",
                principalTable: "teams",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JoinRequests_teams_TeamId",
                table: "JoinRequests");

            migrationBuilder.DropPrimaryKey(
                name: "PK_JoinRequests",
                table: "JoinRequests");

            migrationBuilder.AddColumn<Guid>(
                name: "TeamEntityId",
                table: "JoinRequests",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_JoinRequests",
                table: "JoinRequests",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_JoinRequests_TeamEntityId",
                table: "JoinRequests",
                column: "TeamEntityId");

            migrationBuilder.AddForeignKey(
                name: "FK_JoinRequests_teams_TeamEntityId",
                table: "JoinRequests",
                column: "TeamEntityId",
                principalTable: "teams",
                principalColumn: "Id");
        }
    }
}
