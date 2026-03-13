import type { CoachItem } from './MapStore';

// ─── CoachToast ───────────────────────────────────────────────────────────────
// Renders COACH-level notifications as a dismissable stack.
// Sprint 8: LE-004 (dimension coaching), LE-052 (arrow coaching).

export interface CoachToastProps {
  items: CoachItem[];
  onDismiss: (id: string) => void;
}

function getCoachConfig(lawId: string): {
  actionLabel?: string;
  actionTestId?: string;
} {
  switch (lawId) {
    case 'LE-004':
      return { actionLabel: 'Add dimension', actionTestId: 'add-dimension-btn' };
    case 'LE-052':
      return { actionLabel: 'Draw Arrow', actionTestId: 'draw-arrow-link' };
    default:
      return {};
  }
}

export function CoachToast({ items, onDismiss }: CoachToastProps) {
  if (items.length === 0) return null;

  return (
    <div
      data-testid="coach-toast-container"
      style={{
        position: 'absolute',
        bottom: 24,
        left: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        zIndex: 1100,
        maxWidth: 400,
      }}
    >
      {items.map((item) => {
        const { actionLabel, actionTestId } = getCoachConfig(item.lawId);
        return (
          <div
            key={item.id}
            style={{
              background: '#fff8e1',
              border: '1px solid #f9a825',
              borderRadius: 8,
              padding: '10px 14px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
              fontFamily: 'sans-serif',
              fontSize: 13,
              color: '#5d4037',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1.4 }}>💡</span>
            <span
              data-testid={`coach-toast-message-${item.lawId}`}
              style={{ flex: 1, lineHeight: 1.5 }}
            >
              {item.message}
            </span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
              {actionLabel && (
                <button
                  data-testid={actionTestId}
                  style={{
                    padding: '3px 8px',
                    background: '#f9a825',
                    border: 'none',
                    borderRadius: 4,
                    fontSize: 11,
                    cursor: 'pointer',
                    color: 'white',
                    whiteSpace: 'nowrap',
                  }}
                  onClick={() => onDismiss(item.id)}
                >
                  {actionLabel}
                </button>
              )}
              <button
                data-testid={`coach-toast-dismiss-${item.lawId}`}
                onClick={() => onDismiss(item.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  color: '#888',
                  padding: 0,
                  lineHeight: 1,
                }}
                aria-label="Dismiss coaching tip"
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
