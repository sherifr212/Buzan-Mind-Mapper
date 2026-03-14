using Bmm.Api.Services;
using Xunit;

namespace Bmm.Api.Tests;

public class ReviewScheduleServiceTests
{
    private readonly ReviewScheduleService _sut = new();

    [Fact(
        DisplayName = "AT-RV-001: Review schedule generates 6 entries with correct intervals and all completed=false"
    )]
    public void CreateSchedule_Generates_SixEntries_AllNotCompleted()
    {
        var mapId = Guid.NewGuid();
        var createdAt = DateTime.UtcNow;

        var schedule = _sut.CreateSchedule(mapId, createdAt);

        // 6 review entries
        Assert.Equal(6, schedule.Entries.Count);

        // All entries have completed = false
        Assert.All(schedule.Entries, e => Assert.False(e.Completed));

        // Correct Buzan intervals in minutes: 20, 1440, 10080, 43200, 129600, 259200
        var expectedIntervals = new[] { 20, 1440, 10080, 43200, 129600, 259200 };
        for (int i = 0; i < 6; i++)
        {
            Assert.Equal(expectedIntervals[i], schedule.Entries[i].IntervalMinutes);
            // ScheduledAt should be createdAt + interval
            var expected = createdAt.AddMinutes(expectedIntervals[i]);
            Assert.Equal(expected, schedule.Entries[i].ScheduledAt);
        }

        Assert.Equal(mapId, schedule.MapId);
    }
}
