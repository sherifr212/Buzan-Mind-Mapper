import type { MindMap, BranchNode } from '@bmm/data-model';
import { BOI_RADIUS, SUB_BRANCH_LENGTH } from './constants';

// ─── Radial Auto-Layout ────────────────────────────────────────────────────────
// Distributes BOI branches evenly around the central image,
// and positions sub-branches radially from their parent.

export interface NodePosition {
  id: string;
  x: number;
  y: number;
}

/**
 * Computes positions for all branches in a MindMap using radial auto-layout.
 * BOIs are evenly distributed around the central image.
 * Sub-branches extend radially from their parent.
 *
 * @param map - the MindMap to lay out
 * @param canvasWidth - canvas width in pixels
 * @param canvasHeight - canvas height in pixels
 * @returns map of branchId → {x, y} position
 */
export function computeLayout(
  map: MindMap,
  canvasWidth = 1920,
  canvasHeight = 1080
): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();

  const centreX = canvasWidth / 2;
  const centreY = canvasHeight / 2;

  // Get all BOIs (depth 0)
  const bois = map.branches.filter((b) => b.parentId === null);
  const boiCount = bois.length;

  // Position each BOI evenly around centre
  bois.forEach((boi, index) => {
    const angle = (2 * Math.PI * index) / Math.max(boiCount, 1);
    const x = centreX + BOI_RADIUS * Math.cos(angle);
    const y = centreY + BOI_RADIUS * Math.sin(angle);
    positions.set(boi.id, { id: boi.id, x, y });
  });

  // Position sub-branches radially from their parent
  layoutSubBranches(map.branches, positions, centreX, centreY);

  return positions;
}

function layoutSubBranches(
  allBranches: BranchNode[],
  positions: Map<string, NodePosition>,
  centreX: number,
  centreY: number
): void {
  // Process branches in depth order
  const maxDepth = Math.max(...allBranches.map((b) => b.depth), 0);

  for (let depth = 1; depth <= maxDepth; depth++) {
    const branchesAtDepth = allBranches.filter((b) => b.depth === depth);

    for (const branch of branchesAtDepth) {
      if (!branch.parentId) continue;

      const parentPos = positions.get(branch.parentId);
      if (!parentPos) continue;

      // Get siblings at this depth under the same parent
      const siblings = branchesAtDepth.filter((b) => b.parentId === branch.parentId);
      const siblingIndex = siblings.findIndex((b) => b.id === branch.id);
      const siblingCount = siblings.length;

      // Angle from centre through parent
      const parentAngle = Math.atan2(parentPos.y - centreY, parentPos.x - centreX);

      // Spread siblings in a fan around the parent angle
      const fanSpread = Math.PI / 4; // 45 degrees total spread
      const angleOffset =
        siblingCount > 1
          ? parentAngle + ((siblingIndex / (siblingCount - 1)) - 0.5) * fanSpread
          : parentAngle;

      const x = parentPos.x + SUB_BRANCH_LENGTH * Math.cos(angleOffset);
      const y = parentPos.y + SUB_BRANCH_LENGTH * Math.sin(angleOffset);
      positions.set(branch.id, { id: branch.id, x, y });
    }
  }
}
