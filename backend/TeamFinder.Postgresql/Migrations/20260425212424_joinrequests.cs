using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeamFinder.Postgresql.Migrations
{
    /// <inheritdoc />
    public partial class joinrequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JoinRequestEntity_teams_TeamEntityId",
                table: "JoinRequestEntity");

            migrationBuilder.DropPrimaryKey(
                name: "PK_JoinRequestEntity",
                table: "JoinRequestEntity");

            migrationBuilder.RenameTable(
                name: "JoinRequestEntity",
                newName: "JoinRequests");

            migrationBuilder.RenameIndex(
                name: "IX_JoinRequestEntity_TeamEntityId",
                table: "JoinRequests",
                newName: "IX_JoinRequests_TeamEntityId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_JoinRequests",
                table: "JoinRequests",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_JoinRequests_teams_TeamEntityId",
                table: "JoinRequests",
                column: "TeamEntityId",
                principalTable: "teams",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JoinRequests_teams_TeamEntityId",
                table: "JoinRequests");

            migrationBuilder.DropPrimaryKey(
                name: "PK_JoinRequests",
                table: "JoinRequests");

            migrationBuilder.RenameTable(
                name: "JoinRequests",
                newName: "JoinRequestEntity");

            migrationBuilder.RenameIndex(
                name: "IX_JoinRequests_TeamEntityId",
                table: "JoinRequestEntity",
                newName: "IX_JoinRequestEntity_TeamEntityId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_JoinRequestEntity",
                table: "JoinRequestEntity",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_JoinRequestEntity_teams_TeamEntityId",
                table: "JoinRequestEntity",
                column: "TeamEntityId",
                principalTable: "teams",
                principalColumn: "Id");
        }
    }
}
