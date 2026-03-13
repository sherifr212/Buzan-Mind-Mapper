// ─── Configurable Buzan Rendering Constants ───────────────────────────────────
// All visual scale values are defined here so they can be adjusted without
// hunting through component files.

/** Line stroke width (pt) by branch depth. */
export const LINE_THICKNESS: Record<number, number> = {
  0: 5,   // BOI — thick trunk
  1: 2.5, // sub-branch
  2: 1,   // leaf and beyond
};

/** Returns stroke width for a given depth (depth 2+ → 1pt). */
export function lineThicknessForDepth(depth: number): number {
  return LINE_THICKNESS[Math.min(depth, 2)] ?? 1;
}

/** Font size (px) by branch depth. AT-TY-003, AT-LE-030.
 * AT-LE-030 requires BOI ≥ 1.5× sub-branch: 22 ≥ 14×1.5=21 ✓
 * TECH_SPEC says 18px but ACCEPTANCE_TESTS.md wins (CLAUDE.md rule). */
export const FONT_SIZE: Record<number, number> = {
  0: 22,  // BOI — largest (≥ 1.5× depth-1 per AT-LE-030)
  1: 14,  // sub-branch
  2: 11,  // leaf
};

/** Returns font size for a given depth (depth 2+ → 11px). */
export function fontSizeForDepth(depth: number): number {
  return FONT_SIZE[Math.min(depth, 2)] ?? 11;
}

/** Sans-serif printed font stack. AT-TY-001. */
export const KEYWORD_FONT_FAMILY = "'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

/** Radial distance from centre to BOI label (px). */
export const BOI_RADIUS = 300;

/** Radial step for sub-branches (px). */
export const SUB_BRANCH_LENGTH = 150;
