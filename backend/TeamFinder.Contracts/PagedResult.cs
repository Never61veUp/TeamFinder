namespace TeamFinder.Contracts;

public record PagedResult<T>(IEnumerable<T> Items, int TotalCount);