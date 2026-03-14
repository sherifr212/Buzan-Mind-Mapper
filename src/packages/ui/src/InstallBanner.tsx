import React, { useEffect, useRef, useState } from 'react';

const DISMISS_KEY = 'bmm-install-banner-dismissed';
const DISMISS_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function isIOS(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function isDismissed(): boolean {
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const ts = parseInt(raw, 10);
  return !isNaN(ts) && Date.now() - ts < DISMISS_DURATION_MS;
}

function setDismissed(): void {
  localStorage.setItem(DISMISS_KEY, String(Date.now()));
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Shared prompt ref so Settings page can trigger it
let _storedPrompt: BeforeInstallPromptEvent | null = null;

export function triggerInstallPrompt(): void {
  _storedPrompt?.prompt();
}

export function InstallBanner(): React.ReactElement | null {
  const [visible, setVisible] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isDismissed()) return;

    if (isIOS()) {
      // On iOS, show manual instructions if not previously dismissed
      setShowIOSModal(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      promptRef.current = e as BeforeInstallPromptEvent;
      _storedPrompt = e as BeforeInstallPromptEvent;
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  function handleInstall(): void {
    promptRef.current?.prompt();
    setVisible(false);
  }

  function handleDismiss(): void {
    setDismissed();
    setVisible(false);
  }

  function handleIOSDismiss(): void {
    setDismissed();
    setShowIOSModal(false);
  }

  if (showIOSModal) {
    return (
      <div
        data-testid="ios-install-modal"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          maxWidth: 320,
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: '20px 20px 16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: '#111827' }}>
          Install Radiant on iOS
        </p>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, lineHeight: 1.5 }}>
          Tap the <strong>Share</strong> button (
          <span aria-label="share icon">⬆️</span>) then select{' '}
          <strong>Add to Home Screen</strong> for full offline access.
        </p>
        <button
          onClick={handleIOSDismiss}
          style={{
            fontSize: 13,
            color: '#6b7280',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Dismiss
        </button>
      </div>
    );
  }

  if (!visible) return null;

  return (
    <div
      data-testid="install-banner"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        maxWidth: 340,
        background: '#4f46e5',
        color: '#fff',
        borderRadius: 12,
        padding: '16px 20px',
        boxShadow: '0 8px 32px rgba(79,70,229,0.35)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>
        Install Radiant for full offline access
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          data-testid="install-btn"
          onClick={handleInstall}
          style={{
            flex: 1,
            background: '#fff',
            color: '#4f46e5',
            border: 'none',
            borderRadius: 8,
            padding: '8px 0',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Install
        </button>
        <button
          data-testid="install-dismiss-btn"
          onClick={handleDismiss}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.15)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 8,
            padding: '8px 0',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}
