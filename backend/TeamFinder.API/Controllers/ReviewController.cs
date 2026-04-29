using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TeamFinder.Application.Services;
using TeamFinder.Core.Model.Reviews;

namespace TeamFinder.API.Controllers;

[ApiController]
[Route("api/reviews")]
[Authorize]
public class ReviewController : BaseController
{
    private readonly IReviewService _reviewService;

    public ReviewController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }
    
    [HttpPost]
    public async Task<IActionResult> CreateReview(CreateReviewRequest request)
    {
        var result = await _reviewService.CreateReview(request.TeamId, request.TargetProfileId, CurrentProfileId, request.Rating, request.Comment);
        return result.IsFailure 
            ? BadRequest(result.Error) 
            : Ok();
    }
}

public record CreateReviewRequest(Guid TeamId, Guid TargetProfileId, int Rating, string Comment);