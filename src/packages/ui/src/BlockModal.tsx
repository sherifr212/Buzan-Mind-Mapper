import type { BlockModalState } from './MapStore';

// ─── BlockModal ────────────────────────────────────────────────────────────────
// Displays a BLOCK enforcement result as a centred modal overlay.
// Shown when a Buzan law prevents the user's action from being committed.

interface BlockModalProps {
  block: BlockModalState;
  onDismiss: () => void;
}

export function BlockModal({ block, onDismiss }: BlockModalProps) {
  return (
    <div
      data-testid="block-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onDismiss();
      }}
    >
      <div
        data-testid="block-modal"
        style={{
          background: 'white',
          borderRadius: 12,
          padding: 32,
          maxWidth: 480,
          width: '90%',
          boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>🚫</div>
        <h2
          data-testid="block-modal-title"
          style={{
            margin: '0 0 12px',
            fontSize: 18,
            fontWeight: 700,
            color: '#d32f2f',
            fontFamily: 'sans-serif',
          }}
        >
          Buzan's Law ({block.lawId})
        </h2>
        <p
          data-testid="block-modal-message"
          style={{
            margin: '0 0 20px',
            fontSize: 15,
            lineHeight: 1.6,
            color: '#333',
            fontFamily: 'sans-serif',
          }}
        >
          {block.message}
        </p>
        {block.helpUrl && (
          <a
            href={block.helpUrl}
            data-testid="block-modal-help-link"
            style={{
              display: 'block',
              marginBottom: 20,
              color: '#1565c0',
              fontSize: 14,
              fontFamily: 'sans-serif',
            }}
          >
            {block.lawId === 'LE-001'
              ? 'Why a Central Image?'
              : `Learn about law ${block.lawId}`}
          </a>
        )}
        <button
          onClick={onDismiss}
          data-testid="block-modal-dismiss"
          style={{
            padding: '8px 24px',
            background: '#d32f2f',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            fontSize: 14,
            cursor: 'pointer',
            fontFamily: 'sans-serif',
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
