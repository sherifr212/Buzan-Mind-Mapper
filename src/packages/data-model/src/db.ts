import Dexie, { type Table } from 'dexie';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SyncStatus = 'synced' | 'pending' | 'conflict';
export type SyncOperation = 'create' | 'update' | 'delete';
export type NetworkStatus = 'online' | 'offline' | 'degraded';

export interface LocalMap {
  id: string;
  ownerId: string;
  title: string;
  nodes: unknown;
  edges: unknown;
  theme?: string;
  settings?: unknown;
  createdAt: Date;
  updatedAt: Date;
  syncStatus: SyncStatus;
  localVersion: number;
  deleted?: boolean;
}

export interface SyncQueueItem {
  id: string;
  mapId: string;
  operation: SyncOperation;
  payload: object;
  attempts: number;
  createdAt: Date;
  failedAt?: Date;
}

export interface YjsSnapshot {
  mapId: string;
  snapshotTime: Date;
  stateVector: Uint8Array;
  update: Uint8Array;
}

export interface LocalSetting {
  key: string;
  value: unknown;
}

// ─── Database ─────────────────────────────────────────────────────────────────

export class BmmDatabase extends Dexie {
  maps!: Table<LocalMap, string>;
  syncQueue!: Table<SyncQueueItem, string>;
  snapshots!: Table<YjsSnapshot, string>;
  settings!: Table<LocalSetting, string>;

  constructor() {
    super('bmm-v1');
    this.version(1).stores({
      maps: '&id, ownerId, updatedAt, syncStatus',
      syncQueue: '&id, mapId, operation, createdAt, attempts',
      snapshots: '&mapId, snapshotTime',
      settings: '&key',
    });
  }
}

export const db = new BmmDatabase();
