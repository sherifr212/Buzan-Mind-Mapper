import type { BranchNode, HexColor, UUID } from './types.js';

// ─── Colour Inheritance Resolver ─────────────────────────────────────────────

/**
 * Resolves the effective colour for a branch by walking up to its BOI ancestor.
 * Sub-branches inherit the colour of their BOI ancestor (DM-024).
 *
 * @param branch - the branch to resolve colour for
 * @param allBranches - flat array of all branches in the map
 * @returns the resolved HexColor
 */
export function resolveColour(branch: BranchNode, allBranches: BranchNode[]): HexColor {
  // If already a BOI or has an explicit colour, return it directly
  if (branch.parentId === null) {
    return branch.color;
  }

  // Walk up the tree to find the BOI ancestor
  const parent = allBranches.find((b) => b.id === branch.parentId);
  if (!parent) {
    // Parent not found — return own colour as fallback
    return branch.color;
  }

  return resolveColour(parent, allBranches);
}

// ─── BOI Colour Assigner ──────────────────────────────────────────────────────

/**
 * Assigns a unique colour from the palette to a new BOI branch.
 * Colours already used by existing BOIs are excluded.
 *
 * @param existingBois - existing BOI branches with assigned colours
 * @param palette - the map's colour palette
 * @returns the next available HexColor from the palette, cycling if necessary
 */
export function assignBoiColour(existingBois: BranchNode[], palette: HexColor[]): HexColor {
  const usedColors = new Set(existingBois.map((b) => b.color));

  // Find the first unused palette colour
  for (const color of palette) {
    if (!usedColors.has(color)) {
      return color;
    }
  }

  // All palette colours are used — cycle back based on BOI count
  return palette[existingBois.length % palette.length];
}

// ─── Colour Getter for Branch ID ─────────────────────────────────────────────

/**
 * Gets the effective colour for a branch by ID.
 */
export function getEffectiveColour(
  branchId: UUID,
  allBranches: BranchNode[]
): HexColor | null {
  const branch = allBranches.find((b) => b.id === branchId);
  if (!branch) return null;
  return resolveColour(branch, allBranches);
}
