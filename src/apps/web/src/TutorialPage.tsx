import { useSearchParams, useNavigate } from 'react-router-dom';
import { TutorialFlow, useUserProgressStore } from '@bmm/ui';

// ─── TutorialPage ─────────────────────────────────────────────────────────────
// Full-page tutorial experience at /tutorial[?step=N].
// Sprint 13: Onboarding flow.

export function TutorialPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setTutorialComplete = useUserProgressStore((s) => s.setTutorialComplete);
  const stepParam = parseInt(searchParams.get('step') ?? '0', 10);
  const initialStep = isNaN(stepParam) ? 0 : Math.max(0, stepParam);

  return (
    <div
      style={{
        padding: '2rem',
        maxWidth: 640,
        margin: '0 auto',
        fontFamily: 'sans-serif',
      }}
    >
      <h1 style={{ fontSize: 24, marginBottom: 8, color: '#1e293b' }}>
        Mind Mapping Tutorial
      </h1>
      <p style={{ color: '#64748b', marginBottom: 0 }}>
        Learn Buzan&apos;s core laws in 8 guided steps.
      </p>
      <TutorialFlow
        initialStep={initialStep}
        onComplete={() => {
          setTutorialComplete();
          navigate('/');
        }}
      />
    </div>
  );
}
