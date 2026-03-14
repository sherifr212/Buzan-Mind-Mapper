import { db, type SyncOperation } from './db';
import { v4 as uuidv4 } from 'uuid';

const MAX_ATTEMPTS = 10;

export type SyncEvent =
  | 'sync:start'
  | 'sync:progress'
  | 'sync:complete'
  | 'sync:failed';

export type SyncEventListener = (event: SyncEvent, data?: unknown) => void;

/**
 * Manages offline mutation queue using Dexie's syncQueue table.
 * Processes items in order, retries on failure, abandons after MAX_ATTEMPTS.
 */
export class SyncQueueService {
  private _listeners: Set<SyncEventListener> = new Set();
  private _flushing = false;

  on(listener: SyncEventListener): () => void {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  private _emit(event: SyncEvent, data?: unknown): void {
    this._listeners.forEach((l) => l(event, data));
  }

  async enqueue(mapId: string, operation: SyncOperation, payload: object): Promise<void> {
    await db.syncQueue.add({
      id: uuidv4(),
      mapId,
      operation,
      payload,
      attempts: 0,
      createdAt: new Date(),
    });
  }

  async pendingCount(): Promise<number> {
    return db.syncQueue.count();
  }

  async pendingCountForMap(mapId: string): Promise<number> {
    return db.syncQueue.where('mapId').equals(mapId).count();
  }

  /**
   * Process all pending sync items in order.
   * Calls the provided executor function for each item.
   */
  async flush(
    executor: (item: {
      id: string;
      mapId: string;
      operation: SyncOperation;
      payload: object;
    }) => Promise<void>,
  ): Promise<void> {
    if (this._flushing) return;
    this._flushing = true;
    this._emit('sync:start');

    const items = await db.syncQueue.orderBy('createdAt').toArray();
    let successCount = 0;
    let failCount = 0;

    for (const item of items) {
      // Skip items already abandoned (failedAt set means MAX_ATTEMPTS reached)
      if (item.failedAt) continue;

      try {
        await executor({
          id: item.id,
          mapId: item.mapId,
          operation: item.operation,
          payload: item.payload,
        });
        await db.syncQueue.delete(item.id);
        successCount++;
        this._emit('sync:progress', { successCount, remaining: items.length - successCount });
      } catch (err) {
        const newAttempts = item.attempts + 1;
        if (newAttempts >= MAX_ATTEMPTS) {
          // Abandon after 10 attempts
          await db.syncQueue.update(item.id, {
            attempts: newAttempts,
            failedAt: new Date(),
          });
          this._emit('sync:failed', { item, error: err });
          failCount++;
        } else {
          await db.syncQueue.update(item.id, { attempts: newAttempts });
          failCount++;
        }
      }
    }

    this._flushing = false;
    this._emit('sync:complete', { successCount, failCount });
  }

  async clearForMap(mapId: string): Promise<void> {
    await db.syncQueue.where('mapId').equals(mapId).delete();
  }

  async clearAll(): Promise<void> {
    await db.syncQueue.clear();
  }
}

export const syncQueueService = new SyncQueueService();
