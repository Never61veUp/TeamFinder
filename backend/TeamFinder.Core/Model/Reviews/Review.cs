using CSharpFunctionalExtensions;

namespace TeamFinder.Core.Model.Reviews;

public class Review : Entity<Guid>
{
    public Guid ProfileId { get; private set; }
    public Guid ReviewerId { get; private set; }
    public Guid TeamId { get; private set; }
    public Rating Rating { get; private set; }
    public string Comment { get; private set; }

    private Review(Guid id, Guid profileId, Guid reviewerId, Guid teamId, Rating rating, string comment) : base(id)
    {
        ProfileId = profileId;
        ReviewerId = reviewerId;
        TeamId = teamId;
        Rating = rating;
        Comment = comment;
    }

    public static Result<Review> Create(Guid profileId, Guid reviewerId, Guid teamId, int ratingValue, string comment)
    {
        if (string.IsNullOrWhiteSpace(comment))
            return Result.Failure<Review>("Comment cannot be empty");
        
        var rating = Rating.Create(ratingValue);
        if (rating.IsFailure)
            return Result.Failure<Review>(rating.Error);

        var review = new Review(Guid.NewGuid(), profileId, reviewerId, teamId, rating.Value, comment);
        return Result.Success(review);
    }

    public static Result<Review> Restore(Guid id, Guid profileId, Guid reviewerId, Guid teamId, Rating rating, string comment)
    {
        return new Review(id, profileId, reviewerId, teamId, rating, comment);
    }
}