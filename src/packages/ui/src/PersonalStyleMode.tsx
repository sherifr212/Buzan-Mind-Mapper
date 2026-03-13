// ─── PersonalStyleMode ────────────────────────────────────────────────────────
// Sprint 10: Personal Style Mode unlock UI (AT-LE-070)

export interface PersonalStyleModeProps {
  mapsCompleted: number;
}

export function PersonalStyleMode({ mapsCompleted }: PersonalStyleModeProps) {
  const REQUIRED = 3;

  if (mapsCompleted >= REQUIRED) {
    return (
      <div
        data-testid="personal-style-unlocked"
        style={{
          padding: '2rem',
          background: '#e8f5e9',
          border: '1px solid #43a047',
          borderRadius: 8,
          fontFamily: 'sans-serif',
          textAlign: 'center',
        }}
      >
        <h2 style={{ margin: 0, color: '#2e7d32' }}>Personal Style Mode is active</h2>
        <p style={{ color: '#388e3c', marginTop: 8 }}>
          You can now override sub-branch colours and customise your Mind Map style.
        </p>
      </div>
    );
  }

  const remaining = REQUIRED - mapsCompleted;
  const mapsWord = remaining === 1 ? 'map' : 'maps';

  return (
    <div
      data-testid="personal-style-locked"
      style={{
        padding: '2rem',
        background: '#fafafa',
        border: '1px solid #bdbdbd',
        borderRadius: 8,
        fontFamily: 'sans-serif',
        textAlign: 'center',
        opacity: 0.85,
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
      <h2 style={{ margin: 0, color: '#424242' }}>Personal Style Mode</h2>
      <p style={{ color: '#616161', marginTop: 8 }}>
        Complete {remaining} more {mapsWord} to unlock Personal Style Mode
      </p>
    </div>
  );
}
