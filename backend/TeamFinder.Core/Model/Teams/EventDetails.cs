using CSharpFunctionalExtensions;
using Microsoft.VisualBasic;

namespace TeamFinder.Core.Model.Teams;

public class EventDetails : ValueObject
{
    public string Title { get; }
    public EventPeriod? Period { get; }
    
    private EventDetails(string title, EventPeriod? period)
    {
        Title = title;
        Period = period;
    }
    
    public static Result<EventDetails> Create(string title, DateOnly? start, DateOnly? end)
    {
        if (string.IsNullOrWhiteSpace(title))
            return Result.Failure<EventDetails>("Title is required");
        if (!start.HasValue || !end.HasValue)
            return Result.Success(new EventDetails(title, null));
        
        return EventPeriod.Create(start.Value, end.Value).Map(period => new EventDetails(title, period));
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Title;
        if (Period != null) 
            yield return Period;
    }
}