import type { ReviewSchedule } from './types.js';

// ─── Review Intervals (per Buzan's memory research) ──────────────────────────
// RV-001: 10–30 minutes · 1 day · 1 week · 1 month · 3 months · 6 months

const REVIEW_INTERVALS_MINUTES = [
  20, // 20 minutes after creation (mid-point of 10–30 min window)
  1440, // 1 day (24 × 60)
  10080, // 1 week (7 × 24 × 60)
  43200, // 1 month (30 × 24 × 60)
  129600, // 3 months (90 × 24 × 60)
  259200, // 6 months (180 × 24 × 60)
] as const;

// ─── Generator ────────────────────────────────────────────────────────────────

/**
 * Generates a 6-entry review schedule based on Buzan's spaced-repetition intervals.
 * DM-010 / RV-001
 *
 * @param createdAt - the timestamp when the map was first saved
 * @returns ReviewSchedule with 6 intervals
 */
export function generateReviewSchedule(createdAt: Date): ReviewSchedule {
  const intervals = [...REVIEW_INTERVALS_MINUTES];
  const completed = intervals.map(() => false);

  // nextReviewAt = createdAt + first interval
  const firstReviewMs = createdAt.getTime() + intervals[0] * 60 * 1000;
  const nextReviewAt = new Date(firstReviewMs).toISOString();

  return {
    intervals,
    completed,
    nextReviewAt,
  };
}
