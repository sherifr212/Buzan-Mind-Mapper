import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  getAllReviewSchedules,
  getDueReviews,
  completeReview,
  createReviewSchedule,
  forceAllReviewsComplete,
  forceReviewDue,
  BUZAN_RATIONALES,
  type ReviewSchedule,
} from './ReviewStore';

// ─── Notification Bell + Panel ────────────────────────────────────────────────

function NotificationPanel({
  due,
  onDismiss,
  onCheck,
  onViewOriginal,
}: {
  due: Array<{ schedule: ReviewSchedule; entryIndex: number }>;
  onDismiss: (mapId: string, idx: number) => void;
  onCheck: (mapId: string) => void;
  onViewOriginal: (mapId: string) => void;
}) {
  if (due.length === 0) return null;

  return (
    <div
      data-testid="review-notification-panel"
      style={{
        position: 'fixed',
        top: 60,
        right: 16,
        width: 360,
        background: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: 10,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        zIndex: 1000,
        padding: '16px',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
    >
      <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#1e293b' }}>
        Reviews Due ({due.length})
      </h3>
      {due.map(({ schedule, entryIndex }) => {
        const interval = schedule.entries[entryIndex].intervalMinutes;
        const rationale = BUZAN_RATIONALES[interval] ?? 'Review your map to reinforce long-term memory, according to Buzan\'s memory research.';
        return (
          <div
            key={`${schedule.mapId}-${entryIndex}`}
            data-testid={`review-notification-${schedule.mapId}`}
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: 12,
              marginBottom: 8,
            }}
          >
            <strong style={{ fontSize: 14, display: 'block', marginBottom: 6, color: '#1e293b' }}>
              {schedule.mapTitle}
            </strong>
            <p
              data-testid="review-rationale"
              style={{ fontSize: 12, color: '#475569', margin: '0 0 10px', lineHeight: 1.5 }}
            >
              {rationale}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                data-testid="btn-view-original"
                onClick={() => onViewOriginal(schedule.mapId)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  fontSize: 12,
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  cursor: 'pointer',
                  color: '#334155',
                }}
              >
                View original map
              </button>
              <button
                data-testid="btn-quick-check"
                onClick={() => onCheck(schedule.mapId)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  fontSize: 12,
                  background: '#1e293b',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  color: 'white',
                }}
              >
                Quick Mind Map Check
              </button>
            </div>
            <button
              onClick={() => onDismiss(schedule.mapId, entryIndex)}
              style={{
                marginTop: 6,
                fontSize: 11,
                color: '#94a3b8',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Dismiss
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Review Dashboard Page ────────────────────────────────────────────────────

export function ReviewDashboard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<ReviewSchedule[]>([]);
  const [dueReviews, setDueReviews] = useState<Array<{ schedule: ReviewSchedule; entryIndex: number }>>([]);
  const [notifOpen, setNotifOpen] = useState(false);

  const refresh = useCallback(() => {
    setSchedules(getAllReviewSchedules());
    setDueReviews(getDueReviews());
  }, []);

  useEffect(() => {
    // Test helpers via URL params
    const testMapId = searchParams.get('testMapId');
    const testTitle = searchParams.get('testTitle') ?? 'Test Map';
    const forceDue = searchParams.get('forceDue');
    const forceComplete = searchParams.get('forceComplete');

    if (testMapId) {
      // Ensure a schedule exists for this map
      const existing = getAllReviewSchedules().find((s) => s.mapId === testMapId);
      if (!existing) {
        createReviewSchedule(testMapId, testTitle, new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString());
      }
      if (forceDue === '1') {
        forceReviewDue(testMapId, 1); // force 1-day review to be due
      }
      if (forceComplete === '1') {
        forceAllReviewsComplete(testMapId);
      }
    }

    refresh();
    // Open notification panel if there are due reviews after setup
    if (forceDue === '1') {
      setTimeout(() => {
        setDueReviews(getDueReviews());
        setNotifOpen(true);
      }, 100);
    }
  }, [searchParams, refresh]);

  const handleDismiss = (mapId: string, entryIndex: number) => {
    completeReview(mapId, entryIndex);
    refresh();
  };

  const handleCheck = (mapId: string) => {
    navigate(`/review/check/${mapId}`);
  };

  const handleViewOriginal = (mapId: string) => {
    navigate(`/map/${mapId}`);
  };

  const active = schedules.filter((s) => !s.isLongTermMemory);
  const archived = schedules.filter((s) => s.isLongTermMemory);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, color: '#1e293b' }}>Review Dashboard</h1>
        <button
          data-testid="notification-bell"
          onClick={() => setNotifOpen((v) => !v)}
          style={{
            position: 'relative',
            background: 'none',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '8px 14px',
            cursor: 'pointer',
            fontSize: 20,
          }}
        >
          🔔
          {dueReviews.length > 0 && (
            <span
              data-testid="notification-badge"
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                background: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: 18,
                height: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 'bold',
              }}
            >
              {dueReviews.length}
            </span>
          )}
        </button>
      </div>

      {notifOpen && (
        <NotificationPanel
          due={dueReviews}
          onDismiss={handleDismiss}
          onCheck={handleCheck}
          onViewOriginal={handleViewOriginal}
        />
      )}

      {/* Active maps */}
      <section>
        <h2 style={{ fontSize: 18, color: '#334155', marginBottom: 12 }}>Active Maps</h2>
        {active.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No active review schedules.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {active.map((s) => {
              const nextEntry = s.entries.find((e) => !e.completed);
              const completedCount = s.entries.filter((e) => e.completed).length;
              return (
                <div
                  key={s.mapId}
                  data-testid={`review-map-${s.mapId}`}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: 15, color: '#1e293b' }}>{s.mapTitle}</strong>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      {completedCount}/6 reviews complete
                      {nextEntry && (
                        <> · Next: {new Date(nextEntry.scheduledAt).toLocaleDateString()}</>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <progress value={completedCount} max={6} style={{ width: 80 }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Archive */}
      <section style={{ marginTop: 32 }} data-testid="archive-section">
        <h2 style={{ fontSize: 18, color: '#334155', marginBottom: 12 }}>
          Archive — Long-Term Memory
        </h2>
        {archived.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No archived maps yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {archived.map((s) => (
              <div
                key={s.mapId}
                data-testid={`archived-map-${s.mapId}`}
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 8,
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <strong style={{ fontSize: 15, color: '#166534' }}>{s.mapTitle}</strong>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span
                      data-testid={`ltm-badge-${s.mapId}`}
                      style={{
                        background: '#16a34a',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 'bold',
                      }}
                    >
                      Long-Term Memory
                    </span>
                    {s.annualReviewAt && (
                      <span>Annual review: {new Date(s.annualReviewAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <p style={{ marginTop: 24 }}>
        <Link to="/">← Home</Link>
      </p>
    </div>
  );
}
