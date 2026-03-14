import { v4 as uuidv4 } from 'uuid';
import { db, type LocalMap, type SyncStatus } from './db';
import { syncQueueService } from './syncQueue';
import { NetworkStatusService } from './networkStatus';

const API_BASE = '/api';

/**
 * Offline-first map access layer.
 * - Online: reads/writes via API, mirrors to IndexedDB.
 * - Offline: reads/writes via IndexedDB, enqueues sync items.
 */
export class OfflineMapStore {
  private _networkStatus = NetworkStatusService.getInstance();

  /** Get a single map — IndexedDB first, then API fallback when online. */
  async getMap(id: string): Promise<LocalMap | null> {
    const local = await db.maps.get(id);
    if (local && !local.deleted) return local;

    if (this._networkStatus.isOffline) return local ?? null;

    // Online: fetch from API
    try {
      const resp = await fetch(`${API_BASE}/maps/${id}`);
      if (!resp.ok) return local ?? null;
      const data = await resp.json() as Record<string, unknown>;
      const mapped = this._mapServerToLocal(data);
      await db.maps.put(mapped);
      return mapped;
    } catch {
      return local ?? null;
    }
  }

  /** List maps — IndexedDB when offline, API when online. */
  async listMaps(): Promise<LocalMap[]> {
    if (this._networkStatus.isOffline) {
      return db.maps.filter((m) => !m.deleted).sortBy('updatedAt').then((r) => r.reverse());
    }

    try {
      const resp = await fetch(`${API_BASE}/maps`);
      if (!resp.ok) throw new Error('API error');
      const data = await resp.json() as Record<string, unknown>[];
      const maps = data.map((d) => this._mapServerToLocal(d));
      // Mirror to IndexedDB
      await db.maps.bulkPut(maps);
      return maps;
    } catch {
      // Fall back to IndexedDB
      return db.maps.filter((m) => !m.deleted).sortBy('updatedAt').then((r) => r.reverse());
    }
  }

  /** Save a map — write to IndexedDB; if offline, enqueue sync. */
  async saveMap(map: Partial<LocalMap> & { id: string }): Promise<LocalMap> {
    const existing = await db.maps.get(map.id);
    const now = new Date();
    const isNew = !existing;

    const localMap: LocalMap = {
      id: map.id,
      ownerId: map.ownerId ?? existing?.ownerId ?? '',
      title: map.title ?? existing?.title ?? 'Untitled',
      nodes: map.nodes ?? existing?.nodes ?? [],
      edges: map.edges ?? existing?.edges ?? [],
      theme: map.theme ?? existing?.theme,
      settings: map.settings ?? existing?.settings,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      syncStatus: this._networkStatus.isOffline ? 'pending' : 'synced',
      localVersion: (existing?.localVersion ?? 0) + 1,
    };

    await db.maps.put(localMap);

    if (this._networkStatus.isOffline) {
      await syncQueueService.enqueue(
        map.id,
        isNew ? 'create' : 'update',
        { map: localMap },
      );
    } else {
      // Attempt immediate API sync
      try {
        const method = isNew ? 'POST' : 'PUT';
        const url = isNew ? `${API_BASE}/maps` : `${API_BASE}/maps/${map.id}`;
        await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(localMap),
        });
        await db.maps.update(map.id, { syncStatus: 'synced' });
      } catch {
        // Enqueue for later
        await syncQueueService.enqueue(map.id, isNew ? 'create' : 'update', { map: localMap });
        await db.maps.update(map.id, { syncStatus: 'pending' });
      }
    }

    return localMap;
  }

  /** Delete a map — soft-delete locally; enqueue delete sync. */
  async deleteMap(id: string): Promise<void> {
    await db.maps.update(id, { deleted: true, syncStatus: 'pending', updatedAt: new Date() });
    await syncQueueService.enqueue(id, 'delete', { mapId: id });
  }

  /** Create a new map offline with a client-side UUID. */
  async createOfflineMap(title: string, ownerId: string): Promise<LocalMap> {
    const offlineId = `local-${uuidv4()}`;
    return this.saveMap({
      id: offlineId,
      ownerId,
      title,
      nodes: [],
      edges: [],
    });
  }

  /** Pre-cache top N maps on login. */
  async preCacheTopMaps(n = 20): Promise<void> {
    try {
      const resp = await fetch(`${API_BASE}/maps?limit=${n}&sort=updatedAt`);
      if (!resp.ok) return;
      const data = await resp.json() as Record<string, unknown>[];
      const maps = data.slice(0, n).map((d) => this._mapServerToLocal(d));
      await db.maps.bulkPut(maps);
    } catch {
      // Non-fatal — best effort only
    }
  }

  /** Flush sync queue when going online. */
  async flushOnReconnect(): Promise<void> {
    await syncQueueService.flush(async (item) => {
      if (item.operation === 'delete') {
        await fetch(`${API_BASE}/maps/${item.mapId}`, { method: 'DELETE' });
        await db.maps.delete(item.mapId);
      } else {
        const payload = item.payload as { map: LocalMap };
        const method = item.operation === 'create' ? 'POST' : 'PUT';
        const url =
          item.operation === 'create'
            ? `${API_BASE}/maps`
            : `${API_BASE}/maps/${item.mapId}`;
        const resp = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload.map),
        });
        if (resp.ok) {
          const serverMap = await resp.json() as Record<string, unknown>;
          const serverId = serverMap.id as string;
          // If this was a local-{uuid} map, update the ID
          if (item.mapId !== serverId) {
            await db.maps.delete(item.mapId);
            await db.maps.put(this._mapServerToLocal(serverMap));
          } else {
            await db.maps.update(serverId, { syncStatus: 'synced' });
          }
        } else {
          throw new Error(`API error ${resp.status}`);
        }
      }
    });
  }

  /** Clear all local data on logout. */
  async clearAll(): Promise<void> {
    await db.maps.clear();
    await db.syncQueue.clear();
    await db.snapshots.clear();
    await db.settings.clear();
  }

  private _mapServerToLocal(data: Record<string, unknown>): LocalMap {
    return {
      id: data.id as string,
      ownerId: (data.ownerId ?? data.owner_id ?? '') as string,
      title: (data.title ?? 'Untitled') as string,
      nodes: data.nodes ?? [],
      edges: data.edges ?? [],
      theme: data.theme as string | undefined,
      settings: data.settings,
      createdAt: new Date((data.createdAt ?? data.created_at) as string),
      updatedAt: new Date((data.updatedAt ?? data.updated_at) as string),
      syncStatus: 'synced',
      localVersion: 0,
    };
  }
}

export const offlineMapStore = new OfflineMapStore();
