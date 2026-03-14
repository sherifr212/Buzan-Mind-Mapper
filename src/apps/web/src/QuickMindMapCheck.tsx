import { useParams, useNavigate } from 'react-router-dom';
import { EditableCanvas, useMapStore } from '@bmm/ui';
import type { MindMap } from '@bmm/data-model';
import { getReviewSchedule } from './ReviewStore';
import { useState } from 'react';
import { ComparisonView } from './ComparisonView';

// A minimal blank map for recall
function makeBlankMap(id: string): MindMap {
  return {
    id,
    title: 'Recall Map',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    orientation: 'LANDSCAPE',
    canvasSize: { width: 1200, height: 800 },
    colorPalette: ['#e53e3e', '#dd6b20', '#d69e2e', '#38a169', '#3182ce', '#805ad5'],
    centralImage: {
      id: 'ci-recall',
      type: 'text-image' as const,
      src: '',
      colors: ['#e53e3e', '#3182ce', '#38a169'],
      hasDimension: false,
      position: { x: 0, y: 0 },
      size: { width: 120, height: 80 },
    },
    bois: [],
    branches: [],
    arrows: [],
    reviewSchedule: null,
    isGroupMap: false,
    participants: [],
    linkedMaps: [],
    numericalOrder: [],
    tags: [],
  };
}

export function QuickMindMapCheckPage() {
  const { mapId = '' } = useParams<{ mapId: string }>();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  const [recallMap, setRecallMap] = useState<MindMap | null>(null);

  const schedule = getReviewSchedule(mapId);

  if (done && recallMap) {
    return (
      <ComparisonView
        originalMapId={mapId}
        recallMap={recallMap}
        onClose={() => navigate('/reviews')}
      />
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header prompt */}
      <div
        data-testid="quick-check-header"
        style={{
          background: '#1e293b',
          color: 'white',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div>
          <span
            data-testid="recall-prompt"
            style={{ fontSize: 16, fontWeight: 600 }}
          >
            Recreate your map from memory
          </span>
          <span style={{ marginLeft: 16, fontSize: 13, opacity: 0.7 }}>
            {schedule ? `"${schedule.mapTitle}"` : ''} — Original map is hidden during this check
          </span>
        </div>
        <button
          data-testid="save-recall-btn"
          onClick={() => {
            const map = useMapStore.getState().map;
            setRecallMap(map);
            setDone(true);
          }}
          style={{
            background: '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Save &amp; Compare
        </button>
      </div>

      {/* Blank canvas — original is NOT shown */}
      <div style={{ flex: 1, position: 'relative' }}>
        <EditableCanvas initialMap={makeBlankMap(`recall-${mapId}-${Date.now()}`)} />
      </div>
    </div>
  );
}
