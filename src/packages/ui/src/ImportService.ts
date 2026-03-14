// ImportService — Sprint 17
// Imports .bmm files and runs compliance checking via EnforcementEngine.

import type { MindMap, BranchNode } from '@bmm/data-model';
import { importFromBmm } from './ExportService';

export interface ComplianceViolation {
  branchId: string;
  keyword: string;
  rule: string;
  message: string;
  fixHint: string;
}

export interface ImportResult {
  map: MindMap;
  violations: ComplianceViolation[];
}

/** Check if a keyword violates Buzan's single-word law */
function isMultiWord(keyword: string): boolean {
  return keyword.trim().split(/\s+/).length > 1;
}

/** Runs Buzan compliance checks on an imported map */
export function checkCompliance(map: MindMap): ComplianceViolation[] {
  const violations: ComplianceViolation[] = [];

  for (const branch of map.branches) {
    if (branch.blankLine) continue;

    // Law: Keywords must be single words
    if (isMultiWord(branch.keyword)) {
      violations.push({
        branchId: branch.id,
        keyword: branch.keyword,
        rule: 'KW-001',
        message: `"${branch.keyword}" contains multiple words. Buzan's law requires one keyword per branch.`,
        fixHint: 'Split into separate branches or choose the most essential word.',
      });
    }

    // Law: Every BOI branch must have a colour
    if (
      branch.parentId === null &&
      (!branch.color || branch.color === '#000000' || branch.color === '#ffffff')
    ) {
      violations.push({
        branchId: branch.id,
        keyword: branch.keyword,
        rule: 'CL-001',
        message: `BOI branch "${branch.keyword}" has no distinctive colour.`,
        fixHint: 'Assign a vivid colour to each main branch.',
      });
    }
  }

  return violations;
}

export function importBmmFile(jsonStr: string): ImportResult {
  const map = importFromBmm(jsonStr);
  const violations = checkCompliance(map);
  return { map, violations };
}
