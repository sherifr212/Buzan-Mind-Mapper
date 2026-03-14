using System.Net.WebSockets;

namespace Bmm.Api.Services;

/// <summary>
/// Handles the /hubs/map-sync WebSocket endpoint for Yjs CRDT protocol.
/// Accepts binary Yjs update messages and broadcasts to other clients on the same map.
/// </summary>
public class MapSyncWebSocketHandler
{
    private readonly YjsSyncService _yjsSync;
    private readonly ILogger<MapSyncWebSocketHandler> _logger;

    // Connected clients: mapId → list of WebSocket connections
    private static readonly Dictionary<Guid, List<WebSocket>> _connections = new();
    private static readonly SemaphoreSlim _lock = new(1, 1);

    public MapSyncWebSocketHandler(YjsSyncService yjsSync, ILogger<MapSyncWebSocketHandler> logger)
    {
        _yjsSync = yjsSync;
        _logger = logger;
    }

    public async Task HandleAsync(HttpContext context, Guid mapId, string userId)
    {
        using var ws = await context.WebSockets.AcceptWebSocketAsync();
        _logger.LogInformation("Yjs WS connected: map={MapId} user={UserId}", mapId, userId);

        await RegisterAsync(mapId, ws);

        // Send current snapshot to the new client
        var snapshot = await _yjsSync.GetSnapshotAsync(mapId);
        if (snapshot is { Length: > 0 })
        {
            await ws.SendAsync(
                new ArraySegment<byte>(snapshot),
                WebSocketMessageType.Binary,
                true,
                CancellationToken.None
            );
        }

        // Process incoming updates
        var buffer = new byte[64 * 1024];
        try
        {
            while (ws.State == WebSocketState.Open)
            {
                var result = await ws.ReceiveAsync(
                    new ArraySegment<byte>(buffer),
                    CancellationToken.None
                );

                if (result.MessageType == WebSocketMessageType.Close)
                    break;

                if (result.MessageType == WebSocketMessageType.Binary)
                {
                    var update = buffer[..result.Count];
                    // Persist to Redis
                    await _yjsSync.StoreSnapshotAsync(mapId, update);
                    // Broadcast to other clients on this map
                    await BroadcastAsync(mapId, update, ws);
                }
            }
        }
        catch (WebSocketException ex)
        {
            _logger.LogWarning("Yjs WS error: {Message}", ex.Message);
        }
        finally
        {
            await UnregisterAsync(mapId, ws);
            if (ws.State == WebSocketState.Open)
                await ws.CloseAsync(
                    WebSocketCloseStatus.NormalClosure,
                    "Bye",
                    CancellationToken.None
                );
        }
    }

    private async Task RegisterAsync(Guid mapId, WebSocket ws)
    {
        await _lock.WaitAsync();
        try
        {
            if (!_connections.TryGetValue(mapId, out var list))
            {
                list = new List<WebSocket>();
                _connections[mapId] = list;
            }
            list.Add(ws);
        }
        finally
        {
            _lock.Release();
        }
    }

    private async Task UnregisterAsync(Guid mapId, WebSocket ws)
    {
        await _lock.WaitAsync();
        try
        {
            if (_connections.TryGetValue(mapId, out var list))
            {
                list.Remove(ws);
                if (list.Count == 0)
                    _connections.Remove(mapId);
            }
        }
        finally
        {
            _lock.Release();
        }
    }

    private async Task BroadcastAsync(Guid mapId, byte[] update, WebSocket sender)
    {
        await _lock.WaitAsync();
        List<WebSocket> recipients;
        try
        {
            if (!_connections.TryGetValue(mapId, out var list))
                return;
            recipients = list.Where(ws => ws != sender && ws.State == WebSocketState.Open).ToList();
        }
        finally
        {
            _lock.Release();
        }

        var segment = new ArraySegment<byte>(update);
        var tasks = recipients.Select(ws =>
            ws.SendAsync(segment, WebSocketMessageType.Binary, true, CancellationToken.None)
        );
        await Task.WhenAll(tasks);
    }
}
