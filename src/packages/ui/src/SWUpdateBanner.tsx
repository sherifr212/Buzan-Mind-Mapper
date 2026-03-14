import React, { useEffect, useRef, useState } from 'react';

/**
 * Detects a waiting Service Worker and prompts the user to reload.
 * Uses plain ServiceWorker API — no virtual module dependency.
 */
export function SWUpdateBanner(): React.ReactElement | null {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const pendingUpdateRef = useRef(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.getRegistration('/').then((reg) => {
      if (!reg) return;
      if (reg.waiting && navigator.serviceWorker.controller) {
        setWaitingWorker(reg.waiting);
        setNeedRefresh(true);
        pendingUpdateRef.current = true;
      }
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setNeedRefresh(true);
            pendingUpdateRef.current = true;
          }
        });
      });
    });

    // Only reload when the user explicitly triggered skipWaiting
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (pendingUpdateRef.current) {
        window.location.reload();
      }
    });
  }, []);

  function handleReload(): void {
    waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
  }

  if (!needRefresh) return null;

  return (
    <div
      data-testid="sw-update-banner"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 10000,
        background: '#1f2937',
        color: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: 14,
        boxShadow: '0 -4px 16px rgba(0,0,0,0.2)',
      }}
    >
      <span>Update available — reload to apply</span>
      <button
        data-testid="sw-update-reload-btn"
        onClick={handleReload}
        style={{
          background: '#4f46e5',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '8px 18px',
          fontWeight: 600,
          fontSize: 13,
          cursor: 'pointer',
          marginLeft: 16,
        }}
      >
        Reload
      </button>
    </div>
  );
}
