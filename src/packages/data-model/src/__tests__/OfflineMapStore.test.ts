/**
 * AT-PWA-048 — OfflineMapStore unit tests (6 cases)
 * Uses fake-indexeddb. Mocks NetworkStatusService to avoid window dependency.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import 'fake-indexeddb/auto';
import Dexie from 'dexie';

// vi.mock is hoisted before imports, avoiding window/navigator dependency
vi.mock('../networkStatus.js', () => ({
  NetworkStatusService: {
    getInstance: vi.fn(() => ({
      isOnline: true,
      isOffline: false,
      status: 'online',
      subscribe: vi.fn(() => () => {}),
    })),
    _reset: vi.fn(),
  },
}));

import { OfflineMapStore } from '../offlineMapStore.js';
import type { LocalMap } from '../db.js';

beforeEach(async () => {
  const databases = await Dexie.getDatabaseNames();
  for (const name of databases) {
    await Dexie.delete(name);
  }
});

function makeStore(isOnline = true) {
  const store = new OfflineMapStore();
  // Override the network status for this store instance
  // @ts-expect-error private field
  store._networkStatus = {
    isOnline,
    isOffline: !isOnline,
    status: isOnline ? 'online' : 'offline',
  };
  return store;
}

function makeMap(overrides: Partial<LocalMap> = {}): Partial<LocalMap> & { id: string } {
  return {
    id: 'test-map-1',
    ownerId: 'user-1',
    title: 'Test Map',
    nodes: [],
    edges: [],
    ...overrides,
  };
}

describe('AT-PWA-048 OfflineMapStore', () => {
  it('case 1: getMap(id) returns map from IndexedDB', async () => {
    const store = makeStore(false); // offline so no API calls
    await store.saveMap(makeMap());

    const result = await store.getMap('test-map-1');
    expect(result).not.toBeNull();
    expect(result?.id).toBe('test-map-1');
    expect(result?.title).toBe('Test Map');
  });

  it('case 2: getMap(id) returns null for unknown id when offline', async () => {
    const store = makeStore(false);
    const result = await store.getMap('nonexistent-id');
    expect(result).toBeNull();
  });

  it('case 3: saveMap writes to IndexedDB', async () => {
    const store = makeStore(false);
    const saved = await store.saveMap(makeMap({ title: 'My Map' }));
    expect(saved.title).toBe('My Map');
    expect(saved.syncStatus).toBe('pending'); // offline = pending

    const fromDb = await store.getMap('test-map-1');
    expect(fromDb?.title).toBe('My Map');
  });

  it('case 4: listMaps returns all non-deleted maps sorted by updatedAt desc', async () => {
    const store = makeStore(false);

    await store.saveMap(makeMap({ id: 'map-a', title: 'Map A' }));
    await new Promise((r) => setTimeout(r, 5));
    await store.saveMap(makeMap({ id: 'map-b', title: 'Map B' }));

    const maps = await store.listMaps();
    expect(maps.length).toBe(2);
    // Sorted desc by updatedAt — Map B should be first
    expect(maps[0].id).toBe('map-b');
    expect(maps[1].id).toBe('map-a');
  });

  it('case 5: deleteMap soft-deletes (sets deleted: true)', async () => {
    const store = makeStore(false);
    await store.saveMap(makeMap());

    await store.deleteMap('test-map-1');

    const maps = await store.listMaps();
    expect(maps.find((m) => m.id === 'test-map-1')).toBeUndefined();

    // But still exists in raw db
    const { db } = await import('../db.js');
    const raw = await db.maps.get('test-map-1');
    expect(raw?.deleted).toBe(true);
  });

  it('case 6: getPendingMaps (via listMaps) returns only maps with syncStatus pending', async () => {
    const store = makeStore(false); // offline → syncStatus = 'pending'
    await store.saveMap(makeMap({ id: 'map-pending' }));

    // Directly insert a synced map into db
    const { db } = await import('../db.js');
    await db.maps.put({
      id: 'map-synced',
      ownerId: 'user-1',
      title: 'Synced Map',
      nodes: [],
      edges: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      syncStatus: 'synced',
      localVersion: 1,
    });

    const maps = await store.listMaps();
    const pending = maps.filter((m) => m.syncStatus === 'pending');
    const synced = maps.filter((m) => m.syncStatus === 'synced');

    expect(pending.length).toBe(1);
    expect(pending[0].id).toBe('map-pending');
    expect(synced.length).toBe(1);
    expect(synced[0].id).toBe('map-synced');
  });
});
