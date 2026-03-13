import type { MindMap, BranchNode, Arrow, UUID } from './types.js';
import { ValidationResult, ValidationError } from './errors.js';

// ─── MindMap Validation ───────────────────────────────────────────────────────

export function validateMindMap(map: Partial<MindMap>): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // DM-003: Central image required
  if (!map.centralImage) {
    errors.push({
      code: 'CENTRAL_IMAGE_REQUIRED',
      message: 'Central image is required',
      field: 'centralImage',
    });
  }

  // DM-005: Orientation must be LANDSCAPE — override and warn if not
  if (map.orientation && map.orientation !== 'LANDSCAPE') {
    warnings.push('Orientation forced to LANDSCAPE per Buzan law');
    // Override happens in the caller via the returned object
    (map as MindMap).orientation = 'LANDSCAPE';
  }

  // DM-007: colorPalette must have at least 3 colours
  if (map.colorPalette !== undefined && map.colorPalette.length < 3) {
    errors.push({
      code: 'COLOUR_PALETTE_TOO_SMALL',
      message: 'Colour palette must contain at least 3 colours',
      field: 'colorPalette',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ─── BranchNode Validation ────────────────────────────────────────────────────

export function validateBranch(
  branch: Partial<BranchNode>,
  mapTree?: BranchNode[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // DM-022: keyword must be a single word (no spaces)
  if (branch.keyword !== undefined) {
    const trimmed = branch.keyword.trim();
    if (trimmed.includes(' ')) {
      errors.push({
        code: 'KEYWORD_MULTI_WORD',
        message: 'Keyword must be a single word — no spaces permitted',
        field: 'keyword',
      });
    }
  }

  // DM-029: depth validation — if mapTree provided, check new branch depth does not exceed 13
  // (0-indexed: depth 0=BOI … depth 13=max. Attempting depth 14 fires 'Maximum branch depth of 14 reached')
  if (branch.parentId !== undefined && mapTree) {
    const depth = calculateDepth(branch.parentId, mapTree);
    if (depth >= 13) {
      errors.push({
        code: 'MAX_DEPTH_EXCEEDED',
        message: 'Maximum branch depth of 14 reached',
        field: 'depth',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ─── Arrow Validation ─────────────────────────────────────────────────────────

export function validateArrow(arrow: Partial<Arrow>, map: MindMap): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  const allNodeIds = new Set<UUID>([
    ...map.branches.map((b) => b.id),
    map.centralImage.id,
  ]);

  // DM-050: sourceNodeId must reference an existing node
  if (arrow.sourceNodeId && !allNodeIds.has(arrow.sourceNodeId)) {
    errors.push({
      code: 'SOURCE_NODE_NOT_FOUND',
      message: 'Source node does not exist in this map',
      field: 'sourceNodeId',
    });
  }

  // DM-050: targetNodeId must reference an existing node
  if (arrow.targetNodeId && !allNodeIds.has(arrow.targetNodeId)) {
    errors.push({
      code: 'TARGET_NODE_NOT_FOUND',
      message: 'Target node does not exist in this map',
      field: 'targetNodeId',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ─── Depth Calculator ─────────────────────────────────────────────────────────

/**
 * Calculates the depth of a branch in the tree.
 * depth 0 = BOI (parentId = null), depth 1 = sub-branch of BOI, etc.
 * @param branchId - the branch whose depth to calculate
 * @param allBranches - flat array of all branches in the map
 * @returns depth (0-indexed), or -1 if the branch is not found
 */
export function calculateDepth(branchId: UUID | null, allBranches: BranchNode[]): number {
  if (branchId === null) return -1; // null means it's the central image (parent of BOIs)

  const branch = allBranches.find((b) => b.id === branchId);
  if (!branch) return 0;

  if (branch.parentId === null) return 0; // BOI

  return 1 + calculateDepth(branch.parentId, allBranches);
}
