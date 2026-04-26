using CSharpFunctionalExtensions;

namespace TeamFinder.Application.Mapping;

public static class ListMapping
{
    public static Result<List<TDomain>> MapToDomainList<TEntity, TDomain>(
        this IEnumerable<TEntity> entities,
        Func<TEntity, Result<TDomain>> mapFunc)
    {
        return entities
            .Select(mapFunc).Combine()
            .Map(items => items.ToList());
    }
}