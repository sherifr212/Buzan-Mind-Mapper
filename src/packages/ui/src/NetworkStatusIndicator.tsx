import React, { useEffect, useState } from 'react';
import { NetworkStatusService } from '@bmm/data-model';
import type { NetworkStatus } from '@bmm/data-model';

/**
 * Top nav pill that shows offline/degraded connectivity status.
 * Hidden when online.
 */
export function NetworkStatusIndicator(): React.ReactElement | null {
  const [status, setStatus] = useState<NetworkStatus>(() => {
    try {
      return NetworkStatusService.getInstance().status;
    } catch {
      return 'online';
    }
  });

  useEffect(() => {
    const unsub = NetworkStatusService.getInstance().subscribe(setStatus);
    return unsub;
  }, []);

  if (status === 'online') return null;

  const isOffline = status === 'offline';

  return (
    <div
      data-testid="network-status-indicator"
      data-status={status}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 12px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: isOffline ? '#fee2e2' : '#fef3c7',
        color: isOffline ? '#dc2626' : '#d97706',
        border: `1px solid ${isOffline ? '#fca5a5' : '#fcd34d'}`,
        transition: 'all 0.3s ease',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: isOffline ? '#dc2626' : '#d97706',
          animation: 'pulse 1.5s infinite',
        }}
      />
      {isOffline ? 'Offline — changes saved locally' : 'Limited connectivity'}
    </div>
  );
}
