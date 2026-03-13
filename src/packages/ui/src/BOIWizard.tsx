import { useState } from 'react';

// ─── BOIWizard ────────────────────────────────────────────────────────────────
// Modal shown on new map creation presenting the 7 BOI questions.
// Sprint 8: LE-081 — BOI Wizard triggered on new map creation.

const BOI_QUESTIONS = [
  'What is the main topic or goal you are exploring?',
  'What is the first major theme or category?',
  'What is the second major theme or category?',
  'What is the third major theme or category?',
  'What is the fourth major theme or category?',
  'What is the fifth major theme or category?',
  'What is the sixth major theme or category?',
];

export interface BOIWizardProps {
  onStart: (keywords: string[]) => void;
}

export function BOIWizard({ onStart }: BOIWizardProps) {
  const [answers, setAnswers] = useState<string[]>(Array(7).fill(''));

  const handleChange = (index: number, value: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleStart = () => {
    onStart(answers);
  };

  return (
    <div
      data-testid="boi-wizard"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 12,
          padding: 32,
          maxWidth: 540,
          width: '90%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        }}
      >
        <h2 style={{ margin: '0 0 8px', fontSize: 20, color: '#1e293b' }}>
          Plan Your Mind Map
        </h2>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
          Buzan recommends thinking about your Basic Ordering Ideas (BOIs) before starting. Enter
          up to 7 branch keywords — you can always add more later.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {BOI_QUESTIONS.map((question, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <label
                htmlFor={`boi-question-${i + 1}`}
                style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                BOI {i + 1}
              </label>
              <input
                id={`boi-question-${i + 1}`}
                data-testid={`boi-question-${i + 1}`}
                type="text"
                value={answers[i]}
                onChange={(e) => handleChange(i, e.target.value)}
                placeholder={question}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  fontSize: 14,
                  outline: 'none',
                  fontFamily: 'sans-serif',
                }}
              />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            data-testid="start-mapping-btn"
            onClick={handleStart}
            style={{
              padding: '10px 24px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontSize: 14,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Start mapping
          </button>
        </div>
      </div>
    </div>
  );
}
