using CSharpFunctionalExtensions;

namespace TeamFinder.Core.Model.Teams;

public class EventPeriod : ValueObject
{
    public DateOnly? Start { get; }
    public DateOnly? End { get; }
    public bool IsOver(DateOnly now) => now > End;
    public bool HasStarted(DateOnly now) => now >= Start;

    private EventPeriod(DateOnly? start, DateOnly? end)
    {
        Start = start;
        End = end;
    }
    
    public static Result<EventPeriod> Create(DateOnly? start, DateOnly? end)
    {
        if (end < start)
            return Result.Failure<EventPeriod>("End date cannot be before start date");
            
        return new EventPeriod(start, end);
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        if (Start != null) 
            yield return Start;
        if (End != null) 
            yield return End;
    }
}