namespace Bmm.Api.Services;

public class ReviewEntry
{
    public int IntervalMinutes { get; set; }
    public bool Completed { get; set; } = false;
    public DateTime? ScheduledAt { get; set; }
}

public class ReviewSchedule
{
    public Guid MapId { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<ReviewEntry> Entries { get; set; } = [];
}

public class ReviewScheduleService
{
    // Buzan's empirically derived review intervals:
    // 10–30 min, 1 day, 1 week, 1 month, 3 months, 6 months
    private static readonly int[] IntervalMinutes = [20, 1440, 10080, 43200, 129600, 259200];

    public ReviewSchedule CreateSchedule(Guid mapId, DateTime createdAt)
    {
        var entries = IntervalMinutes
            .Select(interval => new ReviewEntry
            {
                IntervalMinutes = interval,
                Completed = false,
                ScheduledAt = createdAt.AddMinutes(interval),
            })
            .ToList();

        return new ReviewSchedule
        {
            MapId = mapId,
            CreatedAt = createdAt,
            Entries = entries,
        };
    }
}
