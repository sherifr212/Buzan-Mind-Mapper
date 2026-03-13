// ─── ClarityModal ──────────────────────────────────────────────────────────────
// Shown when a user types a multi-word keyword (LE-060).
// Offers two options: split into sibling branches or keep as one word.

interface ClarityModalProps {
  pendingKeyword: string;
  words: string[];
  onSplit: () => void;
  onKeep: () => void;
}

export function ClarityModal({ pendingKeyword, words, onSplit, onKeep }: ClarityModalProps) {
  return (
    <div
      data-testid="clarity-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
    >
      <div
        data-testid="clarity-modal"
        style={{
          background: 'white',
          borderRadius: 12,
          padding: 32,
          maxWidth: 520,
          width: '90%',
          boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
          fontFamily: 'sans-serif',
        }}
      >
        <h2
          data-testid="clarity-modal-title"
          style={{
            margin: '0 0 16px',
            fontSize: 18,
            fontWeight: 700,
            color: '#1565c0',
          }}
        >
          Buzan&apos;s Law: One keyword per branch
        </h2>

        <p style={{ margin: '0 0 8px', fontSize: 14, color: '#333', lineHeight: 1.6 }}>
          Each word has thousands of possible associations. Placing one per line gives each idea
          room to radiate freely and unlocks the full power of your memory.
        </p>

        <p style={{ margin: '0 0 20px', fontSize: 14, color: '#555' }}>
          You typed: <strong>&ldquo;{pendingKeyword}&rdquo;</strong>
        </p>

        <div
          style={{
            background: '#e3f2fd',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 20,
            fontSize: 13,
            color: '#1565c0',
          }}
        >
          Splitting into {words.length} branches:{' '}
          {words.map((w, i) => (
            <span key={i}>
              <strong>&ldquo;{w}&rdquo;</strong>
              {i < words.length - 1 ? ', ' : ''}
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onSplit}
            data-testid="clarity-split-btn"
            style={{
              flex: 1,
              padding: '10px 20px',
              background: '#1565c0',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Split into multiple branches
          </button>
          <button
            onClick={onKeep}
            data-testid="clarity-keep-btn"
            style={{
              flex: 1,
              padding: '10px 20px',
              background: 'white',
              color: '#333',
              border: '1px solid #ccc',
              borderRadius: 6,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Keep as one word
          </button>
        </div>
      </div>
    </div>
  );
}
