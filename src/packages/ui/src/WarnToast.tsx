import type { WarnItem } from './MapStore';

// ─── WarnToast ─────────────────────────────────────────────────────────────────
// Renders WARN enforcement notifications as a stack of dismissable toasts.
// Non-blocking — user can continue editing while toasts are visible.

interface WarnToastProps {
  items: WarnItem[];
  onDismiss: (id: string) => void;
}

export function WarnToast({ items, onDismiss }: WarnToastProps) {
  if (items.length === 0) return null;

  return (
    <div
      data-testid="warn-toast-container"
      style={{
        position: 'absolute',
        bottom: 24,
        right: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 1500,
        maxWidth: 380,
      }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          data-testid={`warn-toast-${item.lawId}`}
          style={{
            background: '#fff8e1',
            border: '1px solid #f9a825',
            borderRadius: 8,
            padding: '12px 16px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
            <p
              data-testid={`warn-toast-message-${item.lawId}`}
              style={{
                margin: 0,
                fontSize: 13,
                lineHeight: 1.5,
                color: '#5d4037',
                fontFamily: 'sans-serif',
                flex: 1,
              }}
            >
              {item.message}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <a
              href={`#law-${item.lawId}`}
              data-testid={`warn-toast-learn-${item.lawId}`}
              style={{ fontSize: 12, color: '#1565c0', fontFamily: 'sans-serif' }}
            >
              Learn why
            </a>
            <button
              onClick={() => onDismiss(item.id)}
              data-testid={`warn-toast-dismiss-${item.lawId}`}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 12,
                cursor: 'pointer',
                color: '#757575',
                fontFamily: 'sans-serif',
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
