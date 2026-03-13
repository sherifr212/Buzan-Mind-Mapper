import { useState } from 'react';
import type { MindMap } from '@bmm/data-model';
import { computeRadiantScore } from '@bmm/enforcement';

// ─── BuzanHealthPanel ─────────────────────────────────────────────────────────
// Sprint 9: HP-001 — Collapsible sidebar showing 8 Buzan health metrics.
// HP-002 — Each metric is clickable — opens law rationale popover.
// HP-003 — Radiant Score radial meter.

// ─── Law rationales (AT-HP-002) ───────────────────────────────────────────────

const LAW_RATIONALE: Record<string, { title: string; text: string }> = {
  centralImage: {
    title: 'Use a Central Image (LE-001)',
    text: 'Buzan mandates a central image for every Mind Map. Images engage both brain hemispheres simultaneously, boosting recall and creativity far beyond text alone.',
  },
  colours: {
    title: 'Use Colour (LE-020–023)',
    text: 'Buzan identifies colour as one of the most powerful tools available to the Mind Mapper. At least 3 distinct colours stimulate memory and distinguish themes.',
  },
  images: {
    title: 'Use Emphasis — Images Throughout (LE-010–012)',
    text: 'Buzan strongly recommends placing images on branches throughout the map. Visual elements activate the imagination and make ideas far more memorable.',
  },
  arrows: {
    title: 'Use Association — Arrows (LE-050–055)',
    text: 'Buzan uses arrows to reveal hidden connections between ideas. Arrows cross boundaries and link related concepts, strengthening associative thinking.',
  },
  keywordCompliance: {
    title: 'Use Clarity — One Word Per Branch (LE-060)',
    text: 'Buzan insists on a single keyword per branch. A single word releases an exponentially greater range of associations than a phrase ever could.',
  },
  maxDepth: {
    title: 'Use Hierarchy (LE-080)',
    text: 'Buzan recommends using hierarchy to organise ideas. A hierarchical structure is far more memorable than a flat list and mirrors natural brain categorisation.',
  },
  bois: {
    title: 'Basic Ordering Ideas (LE-081)',
    text: 'BOIs are the main branches radiating from the Central Image. Buzan recommends planning your BOIs before starting to give the map a strong conceptual skeleton.',
  },
  blankLines: {
    title: 'Blank Lines (LE-080)',
    text: 'Blank branches challenge the brain to complete what has been left unfinished. They stimulate creative thinking and invite new associations.',
  },
};

// ─── Radial Score Meter ───────────────────────────────────────────────────────

function RadialMeter({ score }: { score: number }) {
  const radius = 44;
  const cx = 56;
  const cy = 56;
  const circumference = 2 * Math.PI * radius;
  const arc = (score / 100) * circumference;
  const color = score >= 75 ? '#43a047' : score >= 50 ? '#fb8c00' : '#e53935';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
      <svg width={112} height={112} data-testid="radiant-score-meter">
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={10} />
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeDasharray={`${arc} ${circumference - arc}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        <text x={cx} y={cy + 6} textAnchor="middle" fontSize={22} fontWeight="bold" fill={color}>
          {score}
        </text>
      </svg>
      <span
        data-testid="radiant-score"
        style={{ fontSize: 12, color: '#64748b', marginTop: -4, fontFamily: 'sans-serif' }}
      >
        Radiant Score
      </span>
    </div>
  );
}

// ─── Metric Row ───────────────────────────────────────────────────────────────

function MetricRow({
  testId,
  label,
  value,
  status,
  onInfoClick,
  onFixClick,
  fixLabel,
}: {
  testId: string;
  label: string;
  value: string;
  status: 'ok' | 'warn' | 'info';
  onInfoClick: () => void;
  onFixClick?: () => void;
  fixLabel?: string;
}) {
  const statusColor = status === 'ok' ? '#43a047' : status === 'warn' ? '#fb8c00' : '#1565c0';
  const statusIcon = status === 'ok' ? '✓' : status === 'warn' ? '⚠' : 'ℹ';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 0',
        borderBottom: '1px solid #f1f5f9',
        cursor: 'pointer',
        fontFamily: 'sans-serif',
      }}
      data-testid={testId}
      onClick={onInfoClick}
    >
      <span style={{ color: statusColor, fontSize: 14, width: 16, flexShrink: 0 }}>{statusIcon}</span>
      <span style={{ flex: 1, fontSize: 13, color: '#1e293b' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#334155', flexShrink: 0 }}>{value}</span>
      {onFixClick && fixLabel && (
        <button
          data-testid={`fix-${testId}`}
          onClick={(e) => {
            e.stopPropagation();
            onFixClick();
          }}
          style={{
            padding: '2px 8px',
            background: '#fb8c00',
            color: 'white',
            border: 'none',
            borderRadius: 3,
            fontSize: 11,
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {fixLabel}
        </button>
      )}
    </div>
  );
}

// ─── Rationale Popover ────────────────────────────────────────────────────────

function RationalePopover({
  metricKey,
  onClose,
}: {
  metricKey: string;
  onClose: () => void;
}) {
  const rationale = LAW_RATIONALE[metricKey];
  if (!rationale) return null;

  return (
    <div
      data-testid={`metric-${metricKey}-popover`}
      style={{
        position: 'absolute',
        top: 0,
        right: 320,
        width: 300,
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        padding: 16,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        zIndex: 2100,
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
        <h4 style={{ margin: 0, fontSize: 14, color: '#1e293b', flex: 1 }}>{rationale.title}</h4>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 16 }}
        >
          ×
        </button>
      </div>
      <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{rationale.text}</p>
    </div>
  );
}

// ─── computeHealthMetrics ─────────────────────────────────────────────────────

export interface HealthMetrics {
  hasCentralImage: boolean;
  colourCount: number;
  imageCount: number;
  arrowCount: number;
  keywordCompliance: number; // ratio 0–1
  keywordSingleCount: number;
  keywordTotalCount: number;
  maxDepth: number;
  boiCount: number;
  blankLineCount: number;
}

export function computeHealthMetrics(map: MindMap): HealthMetrics {
  const allColors = new Set<string>();
  if (map.centralImage) {
    for (const c of map.centralImage.colors) allColors.add(c);
  }
  for (const b of map.branches) allColors.add(b.color);

  const imageCount = map.branches.filter((b) => b.image !== null).length;
  const blankLineCount = map.branches.filter((b) => b.blankLine).length;
  const boiCount = map.branches.filter((b) => b.parentId === null).length;
  const maxDepth = map.branches.reduce((m, b) => Math.max(m, b.depth), 0);

  const singleWordBranches = map.branches.filter((b) => !b.keyword.trim().includes(' '));
  const keywordTotalCount = map.branches.length;
  const keywordSingleCount = singleWordBranches.length;
  const keywordCompliance =
    keywordTotalCount > 0 ? keywordSingleCount / keywordTotalCount : 1;

  return {
    hasCentralImage: Boolean(map.centralImage),
    colourCount: allColors.size,
    imageCount,
    arrowCount: map.arrows.length,
    keywordCompliance,
    keywordSingleCount,
    keywordTotalCount,
    maxDepth,
    boiCount,
    blankLineCount,
  };
}

// ─── BuzanHealthPanel ─────────────────────────────────────────────────────────

export interface BuzanHealthPanelProps {
  map: MindMap;
  onQuickFix?: (metricKey: string) => void;
}

export function BuzanHealthPanel({ map, onQuickFix }: BuzanHealthPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activePopover, setActivePopover] = useState<string | null>(null);

  const metrics = computeHealthMetrics(map);
  const score = computeRadiantScore(map);

  const togglePopover = (key: string) => {
    setActivePopover((prev) => (prev === key ? null : key));
  };

  if (!isOpen) {
    return (
      <button
        data-testid="health-panel-toggle"
        onClick={() => setIsOpen(true)}
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1200,
          padding: '6px 12px',
          background: '#1e293b',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          fontSize: 12,
          cursor: 'pointer',
          fontFamily: 'sans-serif',
        }}
      >
        ❤ Health
      </button>
    );
  }

  const rawPct = metrics.keywordCompliance * 100;
  const keywordPct = Number.isInteger(rawPct) ? rawPct : parseFloat(rawPct.toFixed(1));

  return (
    <div
      data-testid="health-panel"
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: 300,
        height: '100%',
        background: 'white',
        borderLeft: '1px solid #e2e8f0',
        boxShadow: '-4px 0 16px rgba(0,0,0,0.08)',
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        padding: '16px 16px 24px',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 15, color: '#1e293b', flex: 1 }}>Buzan Health Panel</h3>
        <button
          data-testid="health-panel-toggle"
          onClick={() => setIsOpen(false)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 18 }}
        >
          ×
        </button>
      </div>

      {/* Radial score meter */}
      <RadialMeter score={score} />

      {/* Metrics */}
      <div style={{ position: 'relative' }}>
        <MetricRow
          testId="metric-central-image"
          label="Central Image"
          value={metrics.hasCentralImage ? '✓ Compliant' : '✗ Missing'}
          status={metrics.hasCentralImage ? 'ok' : 'warn'}
          onInfoClick={() => togglePopover('centralImage')}
          onFixClick={!metrics.hasCentralImage ? () => onQuickFix?.('centralImage') : undefined}
          fixLabel={!metrics.hasCentralImage ? 'Add image' : undefined}
        />
        <MetricRow
          testId="metric-colours"
          label="Colours"
          value={String(metrics.colourCount)}
          status={metrics.colourCount >= 3 ? 'ok' : 'warn'}
          onInfoClick={() => togglePopover('colours')}
          onFixClick={metrics.colourCount < 3 ? () => onQuickFix?.('colours') : undefined}
          fixLabel={metrics.colourCount < 3 ? 'Add colours' : undefined}
        />
        <MetricRow
          testId="metric-images"
          label="Images"
          value={String(metrics.imageCount)}
          status={metrics.imageCount >= 1 ? 'ok' : 'warn'}
          onInfoClick={() => togglePopover('images')}
          onFixClick={metrics.imageCount === 0 ? () => onQuickFix?.('images') : undefined}
          fixLabel={metrics.imageCount === 0 ? 'Add image' : undefined}
        />
        <MetricRow
          testId="metric-arrows"
          label="Arrows"
          value={String(metrics.arrowCount)}
          status={metrics.arrowCount >= 1 ? 'ok' : 'info'}
          onInfoClick={() => togglePopover('arrows')}
          onFixClick={metrics.arrowCount === 0 ? () => onQuickFix?.('arrows') : undefined}
          fixLabel={metrics.arrowCount === 0 ? 'Draw arrow' : undefined}
        />
        <MetricRow
          testId="metric-keyword-compliance"
          label="Keyword compliance"
          value={`${keywordPct}% (${metrics.keywordSingleCount}/${metrics.keywordTotalCount} single-word)`}
          status={metrics.keywordCompliance >= 0.8 ? 'ok' : 'warn'}
          onInfoClick={() => togglePopover('keywordCompliance')}
        />
        <MetricRow
          testId="metric-max-depth"
          label="Max depth"
          value={String(metrics.maxDepth)}
          status={metrics.maxDepth >= 1 ? 'ok' : 'info'}
          onInfoClick={() => togglePopover('maxDepth')}
        />
        <MetricRow
          testId="metric-bois"
          label="BOIs"
          value={String(metrics.boiCount)}
          status={metrics.boiCount >= 3 ? 'ok' : 'info'}
          onInfoClick={() => togglePopover('bois')}
        />
        <MetricRow
          testId="metric-blank-lines"
          label="Blank lines"
          value={String(metrics.blankLineCount)}
          status="info"
          onInfoClick={() => togglePopover('blankLines')}
        />

        {/* Rationale popover */}
        {activePopover && (
          <RationalePopover metricKey={activePopover} onClose={() => setActivePopover(null)} />
        )}
      </div>
    </div>
  );
}
