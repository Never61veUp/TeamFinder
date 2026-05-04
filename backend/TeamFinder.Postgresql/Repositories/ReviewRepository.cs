using CSharpFunctionalExtensions;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Postgresql.Repositories;

public interface IReviewRepository
{
    Task<Result> AddReview(ReviewEntity review, double profileRating);
    Task<Result<List<ReviewEntity>>> GetByProfileId(Guid targetProfileId);
}

public class ReviewRepository : IReviewRepository
{
    private readonly AppDbContext _context;

    public ReviewRepository(AppDbContext context)
    {
        _context = context;
    }
    
    public async Task<Result> AddReview(ReviewEntity review, double profileRating)
    {
        _context.Add(review);
        await UpdateRating(review.TargetId, profileRating);

        try 
        {
            await _context.SaveChangesAsync(); 
            return Result.Success();
        }
        catch (DbUpdateException ex) when (ex.InnerException is PostgresException pg)
        {
            return pg.SqlState switch
            {
                PostgresErrorCodes.UniqueViolation => Result.Failure("Review already added"),
                _ => Result.Failure("Database error")
            };
        }
    }
    
    public async Task<Result<List<ReviewEntity>>> GetByProfileId(Guid targetProfileId)
    {
        try
        {
            var results = await _context.Reviews
                .AsNoTracking()
                .Where(r => r.TargetId == targetProfileId).ToListAsync();
            return Result.Success(results);
        }
        catch (Exception)
        {
            return Result.Failure<List<ReviewEntity>>("Failed to retrieve reviews");
        }
    }
    
    private async Task UpdateRating(Guid profileId, double rating)
    {
        var profile = await _context.Profiles.FirstOrDefaultAsync(p => p.Id == profileId);
        if (profile != null)
        {
            profile.Rating = rating;
            profile.ReviewsCount++;
        }
    }
}