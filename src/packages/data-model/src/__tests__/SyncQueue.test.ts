/**
 * AT-PWA-047 — SyncQueueService unit tests (6 cases)
 * Uses fake-indexeddb to avoid real IndexedDB dependency.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import Dexie from 'dexie';

// ─── Reset Dexie instance before each test ────────────────────────────────────

beforeEach(async () => {
  // Re-open with a fresh database each time
  const databases = await Dexie.getDatabaseNames();
  for (const name of databases) {
    await Dexie.delete(name);
  }
});

// ─── Import the services ──────────────────────────────────────────────────────

import { SyncQueueService } from '../syncQueue.js';
import { BmmDatabase } from '../db.js';

function makeService() {
  // Create isolated db + service instances
  const testDb = new BmmDatabase();
  const svc = new SyncQueueService();
  // @ts-expect-error inject test db
  svc._db = testDb;
  return { db: testDb, svc };
}

describe('AT-PWA-047 SyncQueueService', () => {
  it('case 1: enqueue adds item to Dexie syncQueue', async () => {
    const { db, svc } = makeService();
    // Re-wire db reference
    // Use the global db instead
    await svc.enqueue('map-1', 'update', { title: 'Hello' });
    const count = await svc.pendingCount();
    expect(count).toBe(1);
  });

  it('case 2: flush calls executor for each item and deletes on success', async () => {
    const { svc } = makeService();
    await svc.enqueue('map-1', 'update', { title: 'A' });
    await svc.enqueue('map-1', 'create', { title: 'B' });

    const executed: string[] = [];
    await svc.flush(async (item) => {
      executed.push(item.operation);
    });

    expect(executed).toEqual(['update', 'create']);
    expect(await svc.pendingCount()).toBe(0);
  });

  it('case 3: flush increments attempts on failure', async () => {
    const { svc } = makeService();
    await svc.enqueue('map-2', 'update', { title: 'X' });

    await svc.flush(async () => {
      throw new Error('network error');
    });

    // Item should still be in queue with attempts = 1
    const count = await svc.pendingCount();
    expect(count).toBe(1);
  });

  it('case 4: items with attempts >= 10 are marked failed and skipped', async () => {
    const { svc } = makeService();
    await svc.enqueue('map-3', 'update', { title: 'Z' });

    // Fail 10 times to reach MAX_ATTEMPTS
    for (let i = 0; i < 10; i++) {
      await svc.flush(async () => {
        throw new Error('fail');
      });
    }

    // After 10 failures, item is abandoned (attempts >= 10)
    // A flush with a working executor should not re-try it
    const executed: string[] = [];
    await svc.flush(async (item) => {
      executed.push(item.mapId);
    });
    // Since it was abandoned, it gets failedAt set and is no longer retried
    // The count may be 1 (still in queue but with failedAt) or 0 depending on implementation
    // Our implementation keeps it but marks failedAt - verify the executor was NOT called
    expect(executed).toHaveLength(0);
  });

  it('case 5: clearForMap removes all items for that map', async () => {
    const { svc } = makeService();
    await svc.enqueue('map-A', 'update', {});
    await svc.enqueue('map-A', 'create', {});
    await svc.enqueue('map-B', 'update', {});

    await svc.clearForMap('map-A');
    expect(await svc.pendingCount()).toBe(1);
    expect(await svc.pendingCountForMap('map-A')).toBe(0);
    expect(await svc.pendingCountForMap('map-B')).toBe(1);
  });

  it('case 6: queue is correctly ordered by createdAt', async () => {
    const { svc } = makeService();
    // Enqueue with slight delay to ensure ordering
    await svc.enqueue('map-1', 'create', { order: 1 });
    await new Promise((r) => setTimeout(r, 2));
    await svc.enqueue('map-1', 'update', { order: 2 });
    await new Promise((r) => setTimeout(r, 2));
    await svc.enqueue('map-1', 'delete', { order: 3 });

    const executed: string[] = [];
    await svc.flush(async (item) => {
      executed.push(item.operation);
    });

    expect(executed).toEqual(['create', 'update', 'delete']);
  });
});
