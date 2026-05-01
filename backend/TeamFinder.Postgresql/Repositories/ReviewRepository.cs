using CSharpFunctionalExtensions;
using Microsoft.EntityFrameworkCore;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Postgresql.Repositories;

public interface IReviewRepository
{
    Task<Result> AddReview(ReviewEntity review);
    Task<Result<List<ReviewEntity>>> GetByProfileId(Guid targetProfileId);
}

public class ReviewRepository : IReviewRepository
{
    private readonly AppDbContext _context;

    public ReviewRepository(AppDbContext context)
    {
        _context = context;
    }
    
    public async Task<Result> AddReview(ReviewEntity review)
    {
        await _context.Reviews.AddAsync(review);
        return await _context.SaveChangesAsync() > 0 
            ? Result.Success() 
            : Result.Failure("Failed to add review");
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
}