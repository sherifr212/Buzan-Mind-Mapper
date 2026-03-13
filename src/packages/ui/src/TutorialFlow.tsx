import { useState } from 'react';

// ─── TutorialFlow ─────────────────────────────────────────────────────────────
// Guided 8-step tutorial teaching Buzan's core Mind Mapping laws.
// Sprint 13: Onboarding flow (AT-OB-001, AT-OB-002, AT-OB-004).

type Requirement =
  | 'none'
  | 'add-branch'
  | 'add-image'
  | 'add-boi'
  | 'add-child'
  | 'use-colour'
  | 'add-keyword'
  | 'complete';

interface TutorialStep {
  id: string;
  lawName: string;
  rationale: string;
  instruction: string;
  requirement: Requirement;
  beforeAfter: boolean;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    lawName: 'Introduction',
    rationale:
      'Tony Buzan created Mind Mapping to mirror the radiant thinking of the human brain.',
    instruction: 'Welcome to Mind Mapping!',
    requirement: 'none',
    beforeAfter: false,
  },
  {
    id: 'central-image',
    lawName: 'Law 0: Start with a Central Image',
    rationale:
      'The central image stimulates your imagination and focuses your thinking. Use at least 3 colours.',
    instruction: 'Your map starts with a central image. Notice it has colour and dimension.',
    requirement: 'none',
    beforeAfter: true,
  },
  {
    id: 'hierarchy',
    lawName: 'Law 1: Use Hierarchy',
    rationale:
      "Mind Maps use radiant hierarchy — ideas branch from the centre like a tree. This mirrors the brain's natural categorisation system.",
    instruction: 'Add your first branch to the central image.',
    requirement: 'add-boi',
    beforeAfter: true,
  },
  {
    id: 'one-word',
    lawName: 'Law 2: One Keyword Per Branch',
    rationale:
      'Each branch carries exactly one keyword. This maximises the associative power of each word — giving your brain thousands of links per word.',
    instruction: 'Type a single keyword on your branch.',
    requirement: 'add-keyword',
    beforeAfter: true,
  },
  {
    id: 'add-image',
    lawName: 'Law 3: Use Images',
    rationale:
      'Images are worth a thousand words — they activate both hemispheres of the brain, making your map far more memorable.',
    instruction: 'Add an image to a branch.',
    requirement: 'add-image',
    beforeAfter: true,
  },
  {
    id: 'colour',
    lawName: 'Law 4: Use Colours',
    rationale:
      'Colour adds tremendous energy to your Mind Map and activates the visual cortex — each BOI should have its own distinctive colour.',
    instruction: 'Notice how each main branch has a unique colour.',
    requirement: 'use-colour',
    beforeAfter: false,
  },
  {
    id: 'sub-branches',
    lawName: 'Law 5: Use Sub-branches',
    rationale:
      'Sub-branches allow deeper exploration of each idea. They radiate from main branches, creating a rich, interconnected web of associations.',
    instruction: 'Add a sub-branch to one of your main branches.',
    requirement: 'add-child',
    beforeAfter: true,
  },
  {
    id: 'complete',
    lawName: 'Tutorial Complete!',
    rationale:
      "You've learned the core Buzan laws. Now go create your first free map!",
    instruction: 'Click Complete to start mapping freely.',
    requirement: 'complete',
    beforeAfter: false,
  },
];

export interface TutorialFlowProps {
  initialStep?: number;
  onComplete: () => void;
}

export function TutorialFlow({ initialStep = 0, onComplete }: TutorialFlowProps) {
  const [currentStep, setCurrentStep] = useState(
    Math.min(Math.max(0, initialStep), TUTORIAL_STEPS.length - 1)
  );
  const [blocked, setBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState('');

  // Simulated task completion flags (user would interact with canvas in real use)
  const [hasAddedBOI, setHasAddedBOI] = useState(false);
  const [hasAddedKeyword, setHasAddedKeyword] = useState(false);
  const [hasAddedImage, setHasAddedImage] = useState(false);
  const [hasAddedChild, setHasAddedChild] = useState(false);

  const step = TUTORIAL_STEPS[currentStep];

  function handleNext() {
    // Check requirement for current step
    const req = step.requirement;
    if (req === 'add-boi' && !hasAddedBOI) {
      setBlocked(true);
      setBlockMessage('Please add a branch to continue');
      return;
    }
    if (req === 'add-keyword' && !hasAddedKeyword) {
      setBlocked(true);
      setBlockMessage('Please add a keyword to a branch to continue');
      return;
    }
    if (req === 'add-image' && !hasAddedImage) {
      setBlocked(true);
      setBlockMessage('Please add an image to a branch to continue');
      return;
    }
    if (req === 'add-child' && !hasAddedChild) {
      setBlocked(true);
      setBlockMessage('Please add a sub-branch to continue');
      return;
    }

    setBlocked(false);
    setBlockMessage('');

    if (req === 'complete' || currentStep === TUTORIAL_STEPS.length - 1) {
      onComplete();
      return;
    }

    setCurrentStep((s) => s + 1);
  }

  function handleBack() {
    setBlocked(false);
    setBlockMessage('');
    setCurrentStep((s) => Math.max(0, s - 1));
  }

  // Simulated action buttons for steps with requirements
  function renderActionButton() {
    const req = step.requirement;
    if (req === 'add-boi') {
      return (
        <button
          data-testid="tutorial-action-add-boi"
          onClick={() => { setHasAddedBOI(true); setBlocked(false); }}
          style={{ padding: '6px 14px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          + Add Branch
        </button>
      );
    }
    if (req === 'add-keyword') {
      return (
        <button
          data-testid="tutorial-action-add-keyword"
          onClick={() => { setHasAddedKeyword(true); setBlocked(false); }}
          style={{ padding: '6px 14px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          + Add Keyword
        </button>
      );
    }
    if (req === 'add-image') {
      return (
        <button
          data-testid="tutorial-action-add-image"
          onClick={() => { setHasAddedImage(true); setBlocked(false); }}
          style={{ padding: '6px 14px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          + Add Image
        </button>
      );
    }
    if (req === 'add-child') {
      return (
        <button
          data-testid="tutorial-action-add-child"
          onClick={() => { setHasAddedChild(true); setBlocked(false); }}
          style={{ padding: '6px 14px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
        >
          + Add Sub-branch
        </button>
      );
    }
    return null;
  }

  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  return (
    <div data-testid="tutorial-flow" style={{ fontFamily: 'sans-serif' }}>
      <div
        data-testid={`tutorial-step-${currentStep}`}
        style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          padding: 24,
          marginTop: 16,
        }}
      >
        {/* Progress indicator */}
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
          Step {currentStep + 1} of {TUTORIAL_STEPS.length}
        </div>

        <h2
          data-testid="tutorial-law-name"
          style={{ margin: '0 0 12px', fontSize: 20, color: '#1e293b' }}
        >
          {step.lawName}
        </h2>

        <p
          data-testid="tutorial-rationale"
          style={{ color: '#475569', lineHeight: 1.6, margin: '0 0 16px' }}
        >
          {step.rationale}
        </p>

        {step.beforeAfter && (
          <div
            data-testid="tutorial-before-after"
            style={{
              display: 'flex',
              gap: 16,
              marginBottom: 16,
              background: '#f1f5f9',
              borderRadius: 8,
              padding: 16,
            }}
          >
            <div style={{ flex: 1, textAlign: 'center' }}>
              <strong style={{ display: 'block', marginBottom: 8, color: '#dc2626' }}>Before</strong>
              <div style={{ color: '#64748b', fontSize: 14 }}>flat list</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <strong style={{ display: 'block', marginBottom: 8, color: '#059669' }}>After</strong>
              <div style={{ color: '#64748b', fontSize: 14 }}>mind map hierarchy</div>
            </div>
          </div>
        )}

        <p style={{ color: '#1e293b', fontWeight: 500, margin: '0 0 16px' }}>
          {step.instruction}
        </p>

        {renderActionButton() && (
          <div style={{ marginBottom: 16 }}>{renderActionButton()}</div>
        )}

        {blocked && (
          <div
            data-testid="tutorial-step-blocked"
            style={{
              color: '#dc2626',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 6,
              padding: '8px 12px',
              marginBottom: 16,
              fontSize: 14,
            }}
          >
            {blockMessage}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {currentStep > 0 && (
            <button
              data-testid="tutorial-back-btn"
              onClick={handleBack}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                border: '1px solid #e2e8f0',
                borderRadius: 6,
                background: 'white',
              }}
            >
              ← Back
            </button>
          )}
          <button
            data-testid="tutorial-next-btn"
            onClick={handleNext}
            style={{
              padding: '8px 20px',
              cursor: 'pointer',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
            }}
          >
            {isLastStep ? 'Complete' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
