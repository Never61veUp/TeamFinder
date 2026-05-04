using CSharpFunctionalExtensions;

namespace TeamFinder.Core.Model.Teams;

public class EventDetails : ValueObject
{
    private readonly List<Tag> _tags = [];
    public string Title { get; }
    public EventPeriod? Period { get; }
    public IReadOnlyList<Tag> Tags => _tags;
    
    private EventDetails(string title, EventPeriod? period, List<Tag> tags)
    {
        Title = title;
        Period = period;
        _tags = tags;
    }
    
    public static Result<EventDetails> Create(string title, DateOnly? start, DateOnly? end, List<Tag> tags)
    {
        if(string.IsNullOrWhiteSpace(title))
            title = string.Empty;
        
        return EventPeriod.Create(start, end)
            .Map(period => new EventDetails(title, period, tags));
    }

    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Title;
        yield return Tags;
        if (Period != null) 
            yield return Period;
    }
}