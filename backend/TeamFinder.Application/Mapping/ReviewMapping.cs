using CSharpFunctionalExtensions;
using TeamFinder.Core.Model.Reviews;
using TeamFinder.Postgresql.Model;

namespace TeamFinder.Application.Mapping;

public static class ReviewMapping
{
    public static Result<Review> ToDomain(this ReviewEntity entity)
    {
        var rating = Rating.Create(entity.Rating);
        if(rating.IsFailure)
            return Result.Failure<Review>(rating.Error);
        return Review.Restore(entity.Id, entity.TargetId, entity.ReviewerId, rating.Value, entity.Content);
    }
    
    public static ReviewEntity ToEntity(this Review review)
    {
        return new ReviewEntity
        {
            Id = review.Id,
            TargetId = review.ProfileId,
            ReviewerId = review.ReviewerId,
            Rating = review.Rating.Value,
            Content = review.Comment
        };
    }
}