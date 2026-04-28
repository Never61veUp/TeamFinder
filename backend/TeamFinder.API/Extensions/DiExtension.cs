using Microsoft.EntityFrameworkCore;
using TeamFinder.API.Security;
using TeamFinder.Application.Abstractions;
using TeamFinder.Application.Services;
using TeamFinder.Postgresql;
using TeamFinder.Postgresql.Abstractions;
using TeamFinder.Postgresql.Repositories;

namespace TeamFinder.API.Extensions;

public static class DiExtension
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddInfrastructure(IConfiguration configuration)
        {
            services.AddDbContext<AppDbContext>(options => 
                options.UseNpgsql(configuration.GetConnectionString("Postgres")));
            
            services.AddScoped<IProfileRepository, ProfileRepository>();
            services.AddScoped<ITeamRepository, TeamRepository>();
            services.AddScoped<ISkillRepository, SkillRepository>();
            services.AddScoped<IInvitationRepository, InvitationRepository>();
        
            return services;
        }

        public IServiceCollection AddApplicationServices()
        {
            services.AddSingleton<TelegramWebAppValidator>();
            services.AddSingleton<JwtTokenService>();
            services.AddScoped<IProfileService, ProfileService>();
            services.AddScoped<ISkillService, SkillService>();
            services.AddScoped<IGithubService, GithubService>();
            services.AddScoped<ITeamService, TeamService>();
            services.AddScoped<IInvitationService, InvitationService>();
        
            return services;
        }
    }
}