using CSharpFunctionalExtensions;
using TeamFinder.Application.Mapping;
using TeamFinder.Contracts;
using TeamFinder.Core.Model.Reviews;
using TeamFinder.Core.Model.Teams;
using TeamFinder.Postgresql.Abstractions;
using TeamFinder.Postgresql.Repositories;

namespace TeamFinder.Application.Services;

public interface IReviewService
{
    Task<Result> CreateReview(Guid teamId, Guid profileId, Guid reviewerId, int rating, string comment);
    Task<Result<List<ReviewResponse>>> GetReviewsByProfileId(Guid profileId);
    Task<Result<List<ReviewResponse>>> GetLeftByMe(Guid profileId);
}

public class ReviewService : IReviewService
{
    private readonly ITeamRepository _teamRepository;
    private readonly IReviewRepository _reviewRepository;
    private readonly IProfileRepository _profileRepository;
    private readonly INotificationService _notificationService;

    public ReviewService(ITeamRepository teamRepository, IReviewRepository reviewRepository, 
        IProfileRepository profileRepository, INotificationService notificationService)
    {
        _teamRepository = teamRepository;
        _reviewRepository = reviewRepository;
        _profileRepository = profileRepository;
        _notificationService = notificationService;
    }
    
    public async Task<Result> CreateReview(Guid teamId, Guid profileId, Guid reviewerId, int ratingValue, string comment)
    {
        var team = await _teamRepository.GetById(teamId, TeamStatus.Inactive)
            .Bind(team => team.MapToDomain());
        
        if(team.Value.Status == TeamStatus.Active)
            return Result.Failure<Review>("Team is still active");
        if(team.Value.Members.All(m => m.Id != profileId))
            return Result.Failure<Review>("Only member can create review");

        var profile = await _profileRepository.GetById(profileId)
            .Bind(p => p.ToDomain());
        
        var review = profile.Value.AddReview(reviewerId, teamId, ratingValue, comment);
        if (review.IsFailure)
            return Result.Failure<Review>(review.Error);
        
        var reviewResult = await _reviewRepository.AddReview(review.Value.ToEntity(), profile.Value.Rating);
        if (reviewResult.IsSuccess)
            await _notificationService.NotifyProfileAsync(
                profileId,
                "Вам оставили новый отзыв");
        
        return reviewResult;
    }
    
    public async Task<Result<List<ReviewResponse>>> GetReviewsByProfileId(Guid profileId)
    {
        var reviews = await _reviewRepository.GetByProfileId(profileId)
            .Bind(reviews => reviews.MapToDomainList(r => r.ToDomain()));
        
        var reviewerIds = reviews.Value.Select(r => r.ReviewerId).Distinct().ToList();
        
        var profilesResult = await _profileRepository.GetNamesByIds(reviewerIds);
        var namesDict = profilesResult.IsSuccess 
            ? profilesResult.Value 
            : new Dictionary<Guid, string>();
        //TODO DateTime
        var reviewResponses = reviews.Value.Select(r => new ReviewResponse(
            r.Id,
            r.ReviewerId, 
            namesDict.GetValueOrDefault(r.ReviewerId) ?? "Аноним", 
            r.Rating.Value, 
            r.Comment, 
            r.TeamId,
            r.ProfileId,
            DateTime.UtcNow)).ToList();

        return Result.Success(reviewResponses);
    }
    
    public async Task<Result<List<ReviewResponse>>> GetLeftByMe(Guid profileId)
    {
        var reviews = await _reviewRepository.GetLeftByMeReviews(profileId)
            .Bind(reviews => reviews.MapToDomainList(r => r.ToDomain()));
        
        var reviewerIds = reviews.Value.Select(r => r.ReviewerId).Distinct().ToList();
        
        var profilesResult = await _profileRepository.GetNamesByIds(reviewerIds);
        var namesDict = profilesResult.IsSuccess 
            ? profilesResult.Value 
            : new Dictionary<Guid, string>();
        //TODO DateTime
        var reviewResponses = reviews.Value.Select(r => new ReviewResponse(
            r.Id,
            r.ReviewerId, 
            namesDict.GetValueOrDefault(r.ReviewerId) ?? "Аноним", 
            r.Rating.Value, 
            r.Comment, 
            r.TeamId,
            r.ProfileId,
            DateTime.UtcNow)).ToList();

        return Result.Success(reviewResponses);
    }
}