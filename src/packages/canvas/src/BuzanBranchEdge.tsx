import { getBezierPath } from 'reactflow';
import type { EdgeProps } from 'reactflow';
import type { BranchNode } from '@bmm/data-model';

// ─── BuzanBranchEdge ──────────────────────────────────────────────────────────
// Custom React Flow edge that renders a curved Bézier path.
// RE-002: branches default to curved Bézier paths.
// RE-023: all BOI edges connect from the Central Image boundary.

export interface BuzanBranchEdgeData {
  branch: BranchNode;
}

/** Line thickness by depth: depth 0 = 5pt, depth 1 = 2.5pt, depth 2+ = 1pt */
function strokeWidth(depth: number): number {
  if (depth === 0) return 5;
  if (depth === 1) return 2.5;
  return 1;
}

export function BuzanBranchEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<BuzanBranchEdgeData>) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const depth = data?.branch?.depth ?? 0;
  const color = data?.branch?.color ?? '#555555';

  return (
    <path
      id={id}
      d={edgePath}
      stroke={color}
      strokeWidth={strokeWidth(depth)}
      fill="none"
      strokeLinecap="round"
      data-testid={`branch-edge-${id}`}
    />
  );
}
