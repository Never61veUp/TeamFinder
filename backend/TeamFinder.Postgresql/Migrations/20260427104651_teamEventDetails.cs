using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TeamFinder.Postgresql.Migrations
{
    /// <inheritdoc />
    public partial class teamEventDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "EventEnd",
                table: "teams",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "EventStart",
                table: "teams",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EventTitle",
                table: "teams",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EventEnd",
                table: "teams");

            migrationBuilder.DropColumn(
                name: "EventStart",
                table: "teams");

            migrationBuilder.DropColumn(
                name: "EventTitle",
                table: "teams");
        }
    }
}
