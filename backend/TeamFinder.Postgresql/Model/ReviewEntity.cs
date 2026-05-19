namespace TeamFinder.Postgresql.Model;

public class ReviewEntity
{
    public Guid Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public int Rating { get; set; }
    public Guid TeamId { get; set; }
    public Guid TargetId { get; set; }
    public Guid ReviewerId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}