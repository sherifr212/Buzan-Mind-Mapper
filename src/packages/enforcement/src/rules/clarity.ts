import type { MindMap, BranchNode } from '@bmm/data-model';
import type { EnforcementResult } from '../types.js';

// ─── LE-060: One Keyword Per Branch ──────────────────────────────────────────

/**
 * LE-060: BLOCK if a branch keyword contains more than one word.
 * Returns a BLOCK result with the Clarity Modal message.
 */
export function checkKeywordSingleWord(
  branch: Pick<BranchNode, 'keyword'>
): EnforcementResult[] {
  if (branch.keyword.trim().includes(' ')) {
    return [
      {
        level: 'BLOCK',
        lawId: 'LE-060',
        message:
          "Buzan's Law: One keyword per branch. Each word has thousands of possible associations. Placing one per line gives each idea room to radiate freely.",
        specRef: 'Section 4.3',
      },
    ];
  }
  return [];
}

// ─── LE-062: Landscape Orientation Enforced ───────────────────────────────────

/**
 * LE-062: BLOCK if the user attempts to set portrait orientation.
 */
export function checkOrientationIsLandscape(
  orientation: string
): EnforcementResult[] {
  if (orientation !== 'LANDSCAPE') {
    return [
      {
        level: 'BLOCK',
        lawId: 'LE-062',
        message:
          'Buzan recommends the horizontal (landscape) orientation — it gives more freedom and space, and a horizontal Mind Map is easier to read.',
        specRef: 'Section 4.3',
      },
    ];
  }
  return [];
}

// ─── LE-064: No Disconnected Branches ────────────────────────────────────────

/**
 * LE-064: BLOCK if a branch's parentId references a non-existent node.
 * A branch must be connected to the Central Image or another branch.
 */
export function checkBranchConnected(
  branch: Pick<BranchNode, 'parentId'>,
  map: Pick<MindMap, 'branches' | 'centralImage'>
): EnforcementResult[] {
  if (branch.parentId === null) return []; // BOI — connected directly to central image

  const parentExists = map.branches.some((b) => b.id === branch.parentId);
  if (!parentExists) {
    return [
      {
        level: 'BLOCK',
        lawId: 'LE-064',
        message: 'Branch must be connected to the Central Image or another branch',
        specRef: 'Section 4.3',
      },
    ];
  }
  return [];
}

// ─── LE-066: Keyword Angle Warning ────────────────────────────────────────────

/**
 * LE-066: WARN if any keyword angle exceeds 45° from upright (π/4 radians).
 */
export function checkKeywordAngle(map: Pick<MindMap, 'branches'>): EnforcementResult[] {
  const MAX_ANGLE_RAD = Math.PI / 4; // 45 degrees

  for (const branch of map.branches) {
    const normalizedAngle = Math.abs(branch.angle % Math.PI);
    if (normalizedAngle > MAX_ANGLE_RAD && normalizedAngle < Math.PI - MAX_ANGLE_RAD) {
      return [
        {
          level: 'WARN',
          lawId: 'LE-066',
          message:
            'Buzan recommends keeping your printing as upright as possible for easier reading.',
          specRef: 'Section 4.3',
        },
      ];
    }
  }
  return [];
}

// ─── LE-067: 12+ Branches No Images Warning ───────────────────────────────────

/**
 * LE-067: WARN if a map has 12+ branches and zero inline images.
 */
export function checkBranchCountWithoutImages(map: Pick<MindMap, 'branches'>): EnforcementResult[] {
  const total = map.branches.length;
  const withImages = map.branches.filter((b) => b.image !== null).length;

  if (total >= 12 && withImages === 0) {
    return [
      {
        level: 'WARN',
        lawId: 'LE-067',
        message:
          'Clarity and visual richness are Buzan laws. Your map has many branches but no images. Images dramatically improve recall.',
        specRef: 'Section 4.3',
      },
    ];
  }
  return [];
}

// ─── LE-082: Flat Map Hierarchy Warning ───────────────────────────────────────

/**
 * LE-082: WARN if all branches are at the same depth (flat structure).
 */
export function checkHierarchy(map: Pick<MindMap, 'branches'>): EnforcementResult[] {
  if (map.branches.length === 0) return [];

  const depths = new Set(map.branches.map((b) => b.depth));
  if (depths.size === 1 && map.branches.length > 2) {
    return [
      {
        level: 'WARN',
        lawId: 'LE-082',
        message:
          "Buzan recommends using hierarchy. A hierarchical structure is far more memorable than a flat list — it mirrors how your brain naturally categorises information.",
        specRef: 'Section 4.5',
      },
    ];
  }
  return [];
}
