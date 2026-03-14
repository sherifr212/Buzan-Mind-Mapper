import React, { useEffect, useState } from 'react';
import { syncQueueService, NetworkStatusService } from '@bmm/data-model';
import type { SyncEvent } from '@bmm/data-model';

interface Props {
  mapId?: string;
}

/**
 * Editor toolbar component showing pending changes and sync status.
 * Disappears when sync is complete.
 */
export function PendingChangesIndicator({ mapId }: Props): React.ReactElement | null {
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      const count = mapId
        ? await syncQueueService.pendingCountForMap(mapId)
        : await syncQueueService.pendingCount();
      if (!cancelled) setPendingCount(count);
    };

    void refresh();

    const unsub = syncQueueService.on((event: SyncEvent) => {
      if (event === 'sync:start') setSyncing(true);
      if (event === 'sync:complete' || event === 'sync:failed') {
        setSyncing(false);
        void refresh();
      }
      if (event === 'sync:progress') void refresh();
    });

    return () => {
      cancelled = true;
      unsub();
    };
  }, [mapId]);

  if (pendingCount === 0 && !syncing) return null;

  return (
    <div
      data-testid="pending-changes-indicator"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 500,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: '#f3f4f6',
        color: '#374151',
        border: '1px solid #d1d5db',
      }}
    >
      {syncing ? (
        <>
          <span data-testid="syncing-spinner" style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
          Syncing…
        </>
      ) : (
        <>
          <span>🕐</span>
          <span data-testid="pending-count">{pendingCount} unsaved change{pendingCount !== 1 ? 's' : ''}</span>
        </>
      )}
    </div>
  );
}
