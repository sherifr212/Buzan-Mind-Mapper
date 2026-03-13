// ─── Validation Result ────────────────────────────────────────────────────────

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

// ─── BMMValidationError ───────────────────────────────────────────────────────

export class BMMValidationError extends Error {
  public readonly errors: ValidationError[];

  constructor(message: string, errors: ValidationError[] = []) {
    super(message);
    this.name = 'BMMValidationError';
    this.errors = errors;
  }
}
