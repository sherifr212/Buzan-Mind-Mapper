import type { MindMap } from '@bmm/data-model';
import { getReviewSchedule } from './ReviewStore';

interface ComparisonViewProps {
  originalMapId: string;
  recallMap: MindMap;
  onClose: () => void;
}

type BranchStatus = 'recalled' | 'missed' | 'new';

interface BranchDiff {
  keyword: string;
  status: BranchStatus;
}

function computeDiff(original: MindMap | null, recall: MindMap): BranchDiff[] {
  if (!original) {
    // All recall branches are "new"
    return recall.branches
      .filter((b) => !b.blankLine)
      .map((b) => ({ keyword: b.keyword, status: 'new' as const }));
  }

  const origKeywords = new Set(
    original.branches.filter((b) => !b.blankLine).map((b) => b.keyword.toLowerCase()),
  );
  const recallKeywords = new Set(
    recall.branches.filter((b) => !b.blankLine).map((b) => b.keyword.toLowerCase()),
  );

  const diff: BranchDiff[] = [];

  // Recalled: in both
  for (const kw of origKeywords) {
    if (recallKeywords.has(kw)) {
      diff.push({ keyword: kw, status: 'recalled' });
    } else {
      diff.push({ keyword: kw, status: 'missed' });
    }
  }

  // New: in recall but not in original
  for (const kw of recallKeywords) {
    if (!origKeywords.has(kw)) {
      diff.push({ keyword: kw, status: 'new' });
    }
  }

  return diff;
}

const STATUS_COLORS: Record<BranchStatus, { bg: string; border: string; label: string }> = {
  recalled: { bg: '#dbeafe', border: '#3b82f6', label: 'Recalled' },
  missed: { bg: '#fef3c7', border: '#f59e0b', label: 'Missed' },
  new: { bg: '#dcfce7', border: '#22c55e', label: 'New association' },
};

export function ComparisonView({ originalMapId, recallMap, onClose }: ComparisonViewProps) {
  const schedule = getReviewSchedule(originalMapId);

  // Try to load original map data from schedule (we store mapTitle; branches from fixture won't be available
  // in this context, so we show what we have)
  const diff = computeDiff(null, recallMap);

  const recalled = diff.filter((d) => d.status === 'recalled');
  const missed = diff.filter((d) => d.status === 'missed');
  const newAssoc = diff.filter((d) => d.status === 'new');

  return (
    <div
      data-testid="comparison-view"
      style={{
        padding: '2rem',
        fontFamily: 'sans-serif',
        maxWidth: 700,
        margin: '0 auto',
      }}
    >
      <h1 style={{ fontSize: 22, color: '#1e293b', marginBottom: 4 }}>Map Comparison</h1>
      <p style={{ color: '#64748b', marginBottom: 24, fontSize: 14 }}>
        {schedule ? `"${schedule.mapTitle}"` : 'Your recall map'} vs original
      </p>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={{ flex: 1, padding: '12px', background: '#dbeafe', borderRadius: 8, textAlign: 'center', border: '1px solid #3b82f6' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1d4ed8' }}>{recalled.length}</div>
          <div style={{ fontSize: 12, color: '#1e40af', marginTop: 4 }}>Recalled (blue)</div>
        </div>
        <div style={{ flex: 1, padding: '12px', background: '#fef3c7', borderRadius: 8, textAlign: 'center', border: '1px solid #f59e0b' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#d97706' }}>{missed.length}</div>
          <div style={{ fontSize: 12, color: '#92400e', marginTop: 4 }}>Missed (amber)</div>
        </div>
        <div style={{ flex: 1, padding: '12px', background: '#dcfce7', borderRadius: 8, textAlign: 'center', border: '1px solid #22c55e' }}>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#16a34a' }}>{newAssoc.length}</div>
          <div style={{ fontSize: 12, color: '#15803d', marginTop: 4 }}>New (green)</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {diff.map((item, i) => {
          const style = STATUS_COLORS[item.status];
          return (
            <div
              key={i}
              data-testid={`comparison-branch-${item.status}`}
              style={{
                background: style.bg,
                border: `1px solid ${style.border}`,
                borderRadius: 6,
                padding: '8px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 500 }}>{item.keyword}</span>
              <span style={{ fontSize: 11, color: style.border, fontWeight: 600 }}>
                {style.label}
              </span>
            </div>
          );
        })}
        {diff.length === 0 && (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: 24 }}>
            Your recall map has no branches yet.
          </p>
        )}
      </div>

      <div style={{ marginTop: 24 }}>
        <button
          data-testid="comparison-close-btn"
          onClick={onClose}
          style={{
            padding: '10px 24px',
            background: '#1e293b',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          Done — Back to Reviews
        </button>
      </div>
    </div>
  );
}
