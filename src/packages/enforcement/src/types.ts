// ─── Enforcement Engine Types ─────────────────────────────────────────────────

export type EnforcementLevel = 'BLOCK' | 'WARN' | 'COACH';

export interface EnforcementResult {
  level: EnforcementLevel;
  lawId: string;
  message: string;
  specRef: string;
}

// ─── Edit Events ──────────────────────────────────────────────────────────────

export type EditEventType =
  | 'CREATE_BRANCH'
  | 'UPDATE_BRANCH'
  | 'DELETE_BRANCH'
  | 'CREATE_MAP'
  | 'UPDATE_CENTRAL_IMAGE'
  | 'CREATE_ARROW'
  | 'SET_ORIENTATION';

export interface EditEvent {
  type: EditEventType;
  payload?: Record<string, unknown>;
}
