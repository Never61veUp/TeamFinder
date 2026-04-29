using CSharpFunctionalExtensions;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Postgresql.Repositories;

public interface IReviewRepository
{
    Task<Result> AddReview(ReviewEntity review);
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
}