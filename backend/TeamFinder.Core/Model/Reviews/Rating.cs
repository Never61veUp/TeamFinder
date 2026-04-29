using CSharpFunctionalExtensions;

namespace TeamFinder.Core.Model.Reviews;

public class Rating : ValueObject
{
    public int Value { get; private set; }

    private Rating(int value)
    {
        Value = value;
    }

    public static Result<Rating> Create(int value)
    {
        if (value < 1 || value > 5)
            return Result.Failure<Rating>("Rating must be between 1 and 5.");

        return Result.Success(new Rating(value));
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Value;
    }
}