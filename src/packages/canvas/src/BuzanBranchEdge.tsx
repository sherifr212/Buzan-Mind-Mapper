import { getBezierPath } from 'reactflow';
import type { EdgeProps } from 'reactflow';
import type { BranchNode } from '@bmm/data-model';
import { lineThicknessForDepth } from './constants';

// ─── BuzanBranchEdge ──────────────────────────────────────────────────────────
// Custom React Flow edge that renders a curved Bézier path.
// RE-002: branches default to curved Bézier paths.
// AT-LE-031 / AT-LE-065: line thickness decreases with depth.
// RE-023: all BOI edges connect from the Central Image boundary.

export interface BuzanBranchEdgeData {
  branch: BranchNode;
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
      strokeWidth={lineThicknessForDepth(depth)}
      fill="none"
      strokeLinecap="round"
      data-testid={`branch-edge-${id}`}
    />
  );
}
