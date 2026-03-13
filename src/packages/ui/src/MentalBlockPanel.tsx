import React from 'react';
import { useMapStore } from './MapStore';

interface Props {
  onClose: () => void;
  onMiniBurst: () => void;
  onShowBOIWizard: () => void;
}

export function MentalBlockPanel({ onClose, onMiniBurst, onShowBOIWizard }: Props) {
  const { addBlankLine, selectedBranchId } = useMapStore();

  const handleAddBlankLines = () => {
    addBlankLine(selectedBranchId);
    onClose();
  };

  const handleShowBOI = () => {
    onShowBOIWizard();
    onClose();
  };

  const handleRandomImage = () => {
    // Shows a coaching message — for now just close
    onClose();
  };

  const handlePivot = () => {
    onMiniBurst();
    onClose();
  };

  return (
    <div
      data-testid="mental-block-panel"
      style={{
        position: 'fixed',
        top: 60,
        right: 16,
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: 10,
        padding: 20,
        width: 280,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        zIndex: 3500,
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
        <strong style={{ fontSize: 14 }}>💡 I&apos;m Stuck</strong>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#64748b' }}>×</button>
      </div>
      <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>Choose an action to unlock your thinking:</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          data-testid="mb-add-blank-lines"
          onClick={handleAddBlankLines}
          style={btnStyle}
        >
          ➕ Add blank lines
        </button>
        <button
          data-testid="mb-show-boi"
          onClick={handleShowBOI}
          style={btnStyle}
        >
          🧠 Show BOI questions
        </button>
        <button
          data-testid="mb-random-image"
          onClick={handleRandomImage}
          style={btnStyle}
        >
          🖼 Add a random image
        </button>
        <button
          data-testid="mb-pivot-branch"
          onClick={handlePivot}
          style={btnStyle}
        >
          🔀 Pivot to a branch
        </button>
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '10px 14px',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: 6,
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: 13,
  color: '#1e293b',
  width: '100%',
};
