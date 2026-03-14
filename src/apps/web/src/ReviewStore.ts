// Review & Reinforcement Store — Sprint 16
// Implements Buzan's spaced-repetition review schedule.

export interface ReviewEntry {
  intervalMinutes: number;
  completed: boolean;
  completedAt?: string;
  scheduledAt: string; // ISO8601
}

export interface ReviewSchedule {
  mapId: string;
  mapTitle: string;
  createdAt: string; // ISO8601
  entries: ReviewEntry[];
  isLongTermMemory: boolean;
  archivedAt?: string;
  annualReviewAt?: string; // set after 6th review
}

// Buzan's empirically derived intervals (minutes)
const BUZAN_INTERVALS = [20, 1440, 10080, 43200, 129600, 259200];

const STORAGE_KEY = 'bmm-review-schedules';

export const BUZAN_RATIONALES: Record<number, string> = {
  20: 'Reviewing now — 10–30 minutes after creating — is the most critical step for consolidating this map into long-term memory, according to Buzan\'s memory research.',
  1440: 'Reviewing now — 1 day after creating — is the most critical step for consolidating this map into long-term memory, according to Buzan\'s memory research.',
  10080: 'Reviewing now — 1 week after creating — reinforces the neural pathways formed at creation, according to Buzan\'s memory research.',
  43200: 'Reviewing now — 1 month after creating — anchors this map in long-term memory, according to Buzan\'s memory research.',
  129600: 'Reviewing now — 3 months after creating — is essential for Buzan\'s complete memory consolidation cycle, according to Buzan\'s memory research.',
  259200: 'Reviewing now — 6 months after creating — is the final step to move this map into permanent long-term memory, according to Buzan\'s memory research.',
};

function load(): Record<string, ReviewSchedule> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, ReviewSchedule>) : {};
  } catch {
    return {};
  }
}

function save(store: Record<string, ReviewSchedule>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // storage full — ignore
  }
}

export function createReviewSchedule(mapId: string, mapTitle: string, createdAt?: string): ReviewSchedule {
  const now = createdAt ?? new Date().toISOString();
  const entries: ReviewEntry[] = BUZAN_INTERVALS.map((interval) => ({
    intervalMinutes: interval,
    completed: false,
    scheduledAt: new Date(new Date(now).getTime() + interval * 60000).toISOString(),
  }));

  const schedule: ReviewSchedule = {
    mapId,
    mapTitle,
    createdAt: now,
    entries,
    isLongTermMemory: false,
  };

  const store = load();
  store[mapId] = schedule;
  save(store);
  return schedule;
}

export function getReviewSchedule(mapId: string): ReviewSchedule | null {
  return load()[mapId] ?? null;
}

export function getAllReviewSchedules(): ReviewSchedule[] {
  return Object.values(load());
}

export function getDueReviews(now?: Date): Array<{ schedule: ReviewSchedule; entryIndex: number }> {
  const nowMs = (now ?? new Date()).getTime();
  const store = load();
  const due: Array<{ schedule: ReviewSchedule; entryIndex: number }> = [];

  for (const schedule of Object.values(store)) {
    if (schedule.isLongTermMemory) continue;
    for (let i = 0; i < schedule.entries.length; i++) {
      const entry = schedule.entries[i];
      if (!entry.completed && new Date(entry.scheduledAt).getTime() <= nowMs) {
        due.push({ schedule, entryIndex: i });
        break; // only the earliest due entry per map
      }
    }
  }

  return due;
}

export function completeReview(mapId: string, entryIndex: number): ReviewSchedule | null {
  const store = load();
  const schedule = store[mapId];
  if (!schedule) return null;

  schedule.entries[entryIndex].completed = true;
  schedule.entries[entryIndex].completedAt = new Date().toISOString();

  // Check if all 6 reviews are done → Long-Term Memory
  const allDone = schedule.entries.every((e) => e.completed);
  if (allDone) {
    schedule.isLongTermMemory = true;
    schedule.archivedAt = new Date().toISOString();
    // Annual review: 365 days from now
    schedule.annualReviewAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  }

  store[mapId] = schedule;
  save(store);
  return schedule;
}

/** Force all 6 reviews complete (test helper via URL param) */
export function forceAllReviewsComplete(mapId: string): ReviewSchedule | null {
  const store = load();
  const schedule = store[mapId];
  if (!schedule) return null;

  schedule.entries.forEach((e, i) => {
    e.completed = true;
    e.completedAt = new Date(Date.now() - (6 - i) * 1000).toISOString();
  });
  schedule.isLongTermMemory = true;
  schedule.archivedAt = new Date().toISOString();
  schedule.annualReviewAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  store[mapId] = schedule;
  save(store);
  return schedule;
}

/** Force a specific review entry to be due NOW (test helper) */
export function forceReviewDue(mapId: string, entryIndex: number): void {
  const store = load();
  const schedule = store[mapId];
  if (!schedule) return;
  schedule.entries[entryIndex].scheduledAt = new Date(Date.now() - 1000).toISOString();
  store[mapId] = schedule;
  save(store);
}
