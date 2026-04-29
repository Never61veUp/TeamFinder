using CSharpFunctionalExtensions;
using TeamFinder.Application.Mapping;
using TeamFinder.Core.Model.Reviews;
using TeamFinder.Core.Model.Teams;
using TeamFinder.Postgresql.Abstractions;
using TeamFinder.Postgresql.Repositories;

namespace TeamFinder.Application.Services;

public interface IReviewService
{
    Task<Result> CreateReview(Guid teamId, Guid profileId, Guid reviewerId, int rating, string comment);
}

public class ReviewService : IReviewService
{
    private readonly ITeamRepository _teamRepository;
    private readonly IReviewRepository _reviewRepository;

    public ReviewService(ITeamRepository teamRepository, IReviewRepository reviewRepository)
    {
        _teamRepository = teamRepository;
        _reviewRepository = reviewRepository;
    }
    
    public async Task<Result> CreateReview(Guid teamId, Guid profileId, Guid reviewerId, int ratingValue, string comment)
    {
        var team = await _teamRepository.GetById(teamId, TeamStatus.Inactive)
            .Bind(team => team.MapToDomain());
        
        if(team.Value.Status == TeamStatus.Active)
            return Result.Failure<Review>("Team is still active");
        if(!team.Value.Members.Contains(profileId))
            return Result.Failure<Review>("Only member can create review");

        var rating = Rating.Create(ratingValue);
        if(rating.IsFailure)
            return Result.Failure<Review>(rating.Error);
        
        var review = Review.Create(profileId, reviewerId, rating.Value, comment);
        if (review.IsFailure)
            return Result.Failure<Review>(review.Error);
        
        var result = await _reviewRepository.AddReview(review.Value.ToEntity());
        return result;
    }
}