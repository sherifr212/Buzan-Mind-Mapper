import type { MindMap } from '@bmm/data-model';
import type { EnforcementResult } from '../types.js';

// ─── CS-008: Unrelated Branch Colour Confusion ───────────────────────────────

/**
 * CS-008: WARN when 4+ branches from 3+ different BOIs share the same colour.
 * Using the same colour across unrelated branches may create confusing associations.
 */
export function checkUnrelatedBranchColours(map: MindMap): EnforcementResult | null {
  // Build a map from branchId → BOI ancestor id
  const boiAncestor = new Map<string, string>();

  for (const branch of map.branches) {
    if (branch.parentId === null) {
      boiAncestor.set(branch.id, branch.id);
    }
  }

  // Walk sub-branches and assign BOI ancestor by traversing up
  let changed = true;
  while (changed) {
    changed = false;
    for (const branch of map.branches) {
      if (branch.parentId === null) continue;
      if (!boiAncestor.has(branch.id) && branch.parentId !== null) {
        const parentBoi = boiAncestor.get(branch.parentId);
        if (parentBoi !== undefined) {
          boiAncestor.set(branch.id, parentBoi);
          changed = true;
        }
      }
    }
  }

  // Group branches by colour: colour → Set of BOI ids
  const colourToBOIs = new Map<string, Set<string>>();
  const colourToBranchCount = new Map<string, number>();

  for (const branch of map.branches) {
    const boi = boiAncestor.get(branch.id);
    if (boi === undefined) continue;

    if (!colourToBOIs.has(branch.color)) {
      colourToBOIs.set(branch.color, new Set());
      colourToBranchCount.set(branch.color, 0);
    }
    colourToBOIs.get(branch.color)!.add(boi);
    colourToBranchCount.set(branch.color, (colourToBranchCount.get(branch.color) ?? 0) + 1);
  }

  for (const [color, bois] of colourToBOIs.entries()) {
    const branchCount = colourToBranchCount.get(color) ?? 0;
    if (branchCount >= 4 && bois.size >= 3) {
      return {
        level: 'WARN',
        lawId: 'CS-008',
        message:
          'Using the same colour across unrelated branches may create confusing associations',
        specRef: 'Section 4.6',
      };
    }
  }

  return null;
}
