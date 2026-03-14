using StackExchange.Redis;

namespace Bmm.Api.Services;

/// <summary>
/// Manages Yjs document state in Redis and PostgreSQL for the map sync WebSocket endpoint.
/// </summary>
public class YjsSyncService
{
    private readonly IConnectionMultiplexer _redis;
    private readonly ILogger<YjsSyncService> _logger;

    public YjsSyncService(IConnectionMultiplexer redis, ILogger<YjsSyncService> logger)
    {
        _redis = redis;
        _logger = logger;
    }

    private static string RedisKey(Guid mapId) => $"yjs:map:{mapId}";

    /// <summary>
    /// Store the latest Yjs state snapshot in Redis.
    /// </summary>
    public async Task StoreSnapshotAsync(Guid mapId, byte[] update)
    {
        var db = _redis.GetDatabase();
        await db.StringSetAsync(RedisKey(mapId), update, TimeSpan.FromDays(7));
    }

    /// <summary>
    /// Retrieve the latest snapshot from Redis.
    /// </summary>
    public async Task<byte[]?> GetSnapshotAsync(Guid mapId)
    {
        var db = _redis.GetDatabase();
        var value = await db.StringGetAsync(RedisKey(mapId));
        if (value.IsNull)
            return null;
        return (byte[])value!;
    }

    /// <summary>
    /// Publish a Yjs update to all subscribers of this map's channel.
    /// </summary>
    public async Task PublishUpdateAsync(Guid mapId, byte[] update)
    {
        var sub = _redis.GetSubscriber();
        await sub.PublishAsync(RedisChannel.Literal($"yjs:updates:{mapId}"), update);
    }

    /// <summary>
    /// Subscribe to Yjs updates for a map. Returns the subscription.
    /// </summary>
    public async Task<IDisposable> SubscribeToUpdatesAsync(Guid mapId, Action<byte[]> onUpdate)
    {
        var sub = _redis.GetSubscriber();
        await sub.SubscribeAsync(
            RedisChannel.Literal($"yjs:updates:{mapId}"),
            (_, msg) =>
            {
                if (!msg.IsNull)
                    onUpdate((byte[])msg!);
            }
        );

        return new RedisSubscription(sub, RedisChannel.Literal($"yjs:updates:{mapId}"));
    }

    private sealed class RedisSubscription : IDisposable
    {
        private readonly ISubscriber _sub;
        private readonly RedisChannel _channel;

        public RedisSubscription(ISubscriber sub, RedisChannel channel)
        {
            _sub = sub;
            _channel = channel;
        }

        public void Dispose()
        {
            _sub.UnsubscribeAsync(_channel);
        }
    }
}
