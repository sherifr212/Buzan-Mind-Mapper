import type { MindMap, BranchNode } from '@bmm/data-model';
import type { EnforcementResult } from '../types.js';

// ─── LE-001: Central Image Required ──────────────────────────────────────────

/**
 * LE-001: BLOCK creation of any map without a Central Image.
 */
export function checkCentralImage(map: Pick<MindMap, 'centralImage'>): EnforcementResult[] {
  if (!map.centralImage) {
    return [
      {
        level: 'BLOCK',
        lawId: 'LE-001',
        message: 'Every Mind Map begins with a Central Image',
        specRef: 'Section 4.1.1',
      },
    ];
  }
  return [];
}

// ─── LE-003: Central Image Colour Count ──────────────────────────────────────

/**
 * LE-003: WARN if the Central Image uses fewer than 3 distinct colours.
 */
export function checkCentralImageColours(
  map: Pick<MindMap, 'centralImage'>
): EnforcementResult[] {
  if (!map.centralImage) return [];

  const n = map.centralImage.colors.length;
  if (n < 3) {
    return [
      {
        level: 'WARN',
        lawId: 'LE-003',
        message: `Your Central Image uses only ${n} colour(s). Buzan recommends 3 or more colours to stimulate memory and creativity and escape monotone monotony.`,
        specRef: 'Section 4.1.1',
      },
    ];
  }
  return [];
}

// ─── LE-010: Branch Image Density ────────────────────────────────────────────

/**
 * LE-010: WARN if a map has more than 8 branches and zero inline images.
 */
export function checkBranchImageDensity(
  map: Pick<MindMap, 'branches'>
): EnforcementResult[] {
  const totalBranches = map.branches.length;
  const branchesWithImages = map.branches.filter((b) => b.image !== null).length;

  if (totalBranches > 8 && branchesWithImages === 0) {
    return [
      {
        level: 'WARN',
        lawId: 'LE-010',
        message:
          'Your map is growing — great! Buzan strongly recommends placing images on branches, not just the centre. Images trigger associations and multiply your intellectual power. Try adding one now.',
        specRef: 'Section 4.1.2',
      },
    ];
  }
  return [];
}

// ─── LE-012: Image Density Ratio ─────────────────────────────────────────────

/**
 * LE-012: Track image density ratio (images / branches).
 * Returns the computed ratio (not an EnforcementResult — used for Buzan Health Panel).
 */
export function computeImageDensityRatio(map: Pick<MindMap, 'branches'>): number {
  const total = map.branches.length;
  if (total === 0) return 0;
  const withImages = map.branches.filter((b) => b.image !== null).length;
  return withImages / total;
}

// ─── LE-020: BOI Colour Uniqueness ───────────────────────────────────────────

/**
 * LE-020: BLOCK if two adjacent BOIs share the same colour.
 */
export function checkDuplicateBoiColours(map: Pick<MindMap, 'branches'>): EnforcementResult[] {
  const bois = map.branches.filter((b) => b.parentId === null);
  const seenColors = new Map<string, string>(); // color → branchId
  const results: EnforcementResult[] = [];

  for (const boi of bois) {
    const existingId = seenColors.get(boi.color);
    if (existingId) {
      results.push({
        level: 'BLOCK',
        lawId: 'LE-020',
        message: `Each BOI must have a unique colour. Buzan assigns distinct colours to each main branch so your brain can instantly distinguish categories and their sub-branches, accelerating both creativity and recall.`,
        specRef: 'Section 4.1.3',
      });
      break; // one error is enough
    }
    seenColors.set(boi.color, boi.id);
  }

  return results;
}

// ─── LE-021: Minimum Total Colours ───────────────────────────────────────────

/**
 * LE-021: WARN if the entire map uses fewer than 3 distinct colours.
 */
export function checkMinimumColours(map: Pick<MindMap, 'branches' | 'centralImage'>): EnforcementResult[] {
  const allColors = new Set<string>();

  if (map.centralImage) {
    for (const color of map.centralImage.colors) {
      allColors.add(color);
    }
  }

  for (const branch of map.branches) {
    allColors.add(branch.color);
  }

  if (allColors.size < 3) {
    return [
      {
        level: 'WARN',
        lawId: 'LE-021',
        message:
          'Buzan identifies colour as one of the most powerful tools for memory and creativity. A monochrome map is visually boring and actively impedes recall.',
        specRef: 'Section 4.1.3',
      },
    ];
  }
  return [];
}

// ─── LE-022: Colour Inheritance ───────────────────────────────────────────────

/**
 * LE-022: Automatically inherit BOI colour to all child branches.
 * Returns BLOCK results for any sub-branch that has a different colour than its BOI ancestor.
 * Used to enforce colour inheritance on child creation.
 */
export function checkColourInheritance(
  branch: Pick<BranchNode, 'id' | 'parentId' | 'color'>,
  allBranches: Pick<BranchNode, 'id' | 'parentId' | 'color'>[]
): EnforcementResult[] {
  if (branch.parentId === null) return []; // BOI — no inheritance needed

  // Find the BOI ancestor
  const boiColor = findBoiColor(branch.parentId, allBranches);
  if (boiColor === null) return []; // Can't resolve ancestry — allow

  if (branch.color !== boiColor) {
    return [
      {
        level: 'BLOCK',
        lawId: 'LE-022',
        message:
          'Sub-branches inherit their BOI colour. Use Personal Style Mode to override.',
        specRef: 'Section 4.1.3',
      },
    ];
  }

  return [];
}

function findBoiColor(
  nodeId: string,
  allBranches: Pick<BranchNode, 'id' | 'parentId' | 'color'>[]
): string | null {
  const node = allBranches.find((b) => b.id === nodeId);
  if (!node) return null;
  if (node.parentId === null) return node.color; // This IS the BOI
  return findBoiColor(node.parentId, allBranches);
}

// ─── LE-030: BOI keyword size ─────────────────────────────────────────────────

/**
 * LE-030/031: Check size ratios and line thickness.
 * Returns WARN if BOI fontSize < 1.5× sub-branch fontSize.
 * (Canvas-layer concern — here we validate the metadata stored on branches)
 */
export function checkSizeVariation(map: Pick<MindMap, 'branches'>): EnforcementResult[] {
  // Size variation is primarily a rendering concern.
  // At the data model layer, we validate via lineThickness: BOI (depth 0) must be thicker than depth 1+.
  const results: EnforcementResult[] = [];
  const bois = map.branches.filter((b) => b.parentId === null);
  const subBranches = map.branches.filter((b) => b.parentId !== null);

  for (const boi of bois) {
    for (const sub of subBranches) {
      if (sub.lineThickness >= boi.lineThickness) {
        results.push({
          level: 'WARN',
          lawId: 'LE-031',
          message:
            'Branch line thickness must decrease with depth. BOI branches must be the thickest.',
          specRef: 'Section 4.1.4',
        });
        return results; // one warning is enough
      }
    }
  }

  return results;
}
