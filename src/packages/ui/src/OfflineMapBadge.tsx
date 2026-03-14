import React from 'react';
import type { SyncStatus } from '@bmm/data-model';

interface Props {
  syncStatus: SyncStatus;
}

/**
 * Badge for map list cards indicating offline/pending state.
 */
export function OfflineMapBadge({ syncStatus }: Props): React.ReactElement | null {
  if (syncStatus === 'synced') return null;

  const isPending = syncStatus === 'pending';

  return (
    <span
      data-testid="offline-map-badge"
      title={isPending ? 'Changes pending sync' : 'Sync conflict'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 3,
        padding: '2px 8px',
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 600,
        background: isPending ? '#fef3c7' : '#fee2e2',
        color: isPending ? '#d97706' : '#dc2626',
        border: `1px solid ${isPending ? '#fcd34d' : '#fca5a5'}`,
      }}
    >
      🕐 {isPending ? 'Pending' : 'Conflict'}
    </span>
  );
}
