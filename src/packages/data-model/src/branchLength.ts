// ─── Branch Length Calculator ─────────────────────────────────────────────────
//
// Per DM-027: branch length MUST equal the rendered pixel width of the keyword text.
// In a headless/server context, we use a character-width approximation.
// Average character width ≈ 0.6 × fontSize for most Latin proportional fonts.
// This approximation is consistent across the data model layer.
// The canvas layer can override with actual DOM measurements.

const CHAR_WIDTH_RATIO = 0.6;

/**
 * Calculates the expected branch length (pixel width) for a keyword at a given font size.
 * DM-027: branch.length must equal the rendered pixel width of the keyword text.
 *
 * @param keyword - the branch keyword (single word)
 * @param fontSize - font size in points
 * @returns estimated pixel width (±1px tolerance per AT-DM-011)
 */
export function calculateBranchLength(keyword: string, fontSize: number): number {
  return keyword.length * fontSize * CHAR_WIDTH_RATIO;
}
