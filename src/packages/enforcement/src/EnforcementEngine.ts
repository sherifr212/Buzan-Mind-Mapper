import type { MindMap } from '@bmm/data-model';
import type { EnforcementResult, EditEvent } from './types.js';
import {
  checkCentralImage,
  checkCentralImageColours,
  checkBranchImageDensity,
  checkDuplicateBoiColours,
  checkMinimumColours,
  checkSizeVariation,
} from './rules/emphasis.js';

// ─── EnforcementEngine ────────────────────────────────────────────────────────

/**
 * The EnforcementEngine is a pure-logic module.
 * It takes a map state and an edit event and returns enforcement results.
 * No UI, no React — pure TypeScript.
 */
export class EnforcementEngine {
  /**
   * Checks the given map state against all active Buzan laws.
   * Returns an array of EnforcementResult — each result indicates a BLOCK, WARN, or COACH.
   *
   * @param map - the current map state after the edit event has been applied
   * @param _event - the edit event that triggered the check (for future law filtering)
   * @returns array of EnforcementResult (may be empty if no violations)
   */
  check(map: MindMap, _event: EditEvent): EnforcementResult[] {
    const results: EnforcementResult[] = [];

    // LE-001: Central image required
    results.push(...checkCentralImage(map));

    // LE-003: Central image colour count
    results.push(...checkCentralImageColours(map));

    // LE-010: Branch image density
    results.push(...checkBranchImageDensity(map));

    // LE-020: BOI colour uniqueness
    results.push(...checkDuplicateBoiColours(map));

    // LE-021: Minimum total colours
    results.push(...checkMinimumColours(map));

    // LE-030/031: Size variation
    results.push(...checkSizeVariation(map));

    return results;
  }
}
