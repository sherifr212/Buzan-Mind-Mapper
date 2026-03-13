import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { BranchNode } from '@bmm/data-model';
import { fontSizeForDepth, KEYWORD_FONT_FAMILY } from './constants';

// ─── BranchLabelNode ──────────────────────────────────────────────────────────
// Renders the keyword label for a branch node in the canvas.
// AT-TY-001: sans-serif printed font.
// AT-TY-002 / AT-LE-030: BOI keywords in UPPER CASE, visually larger.
// AT-TY-003: font size decreases with depth.
// AT-TY-005: keywords flip to stay upright when angle > π (lower half).

export interface BranchLabelNodeData {
  branch: BranchNode;
  /** Branch angle in radians — used for upright flip (AT-TY-005). */
  angle?: number;
}

/**
 * Returns true when the branch angle places the label in the lower half of the
 * canvas (π < angle < 2π), requiring a 180° flip to remain upright.
 * AT-TY-005.
 */
function needsFlip(angle: number | undefined): boolean {
  if (angle === undefined) return false;
  const normalised = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  return normalised > Math.PI && normalised < 2 * Math.PI;
}

function BranchLabelNodeComponent({ data }: NodeProps<BranchLabelNodeData>) {
  const { branch, angle } = data;

  // AT-TY-002: BOI keywords default to UPPER CASE (isUpperCase flag)
  const label = branch.isUpperCase
    ? branch.keyword.toUpperCase()
    : branch.keyword;

  const fontSize = fontSizeForDepth(branch.depth);
  const fontWeight = branch.depth === 0 ? 'bold' : 'normal';
  const flip = needsFlip(angle);

  return (
    <div
      style={{
        color: branch.color,
        fontSize,
        fontWeight,
        fontFamily: KEYWORD_FONT_FAMILY,
        // AT-TY-002: enforce uppercase via CSS as well (belt-and-suspenders)
        textTransform: branch.isUpperCase ? 'uppercase' : 'none',
        whiteSpace: 'nowrap',
        padding: '2px 6px',
        background: 'transparent',
        userSelect: 'none',
        pointerEvents: 'none',
        // AT-TY-005: flip label for branches in lower canvas half
        transform: flip ? 'rotate(180deg)' : undefined,
        transformOrigin: 'center center',
      }}
      data-testid={`branch-label-${branch.id}`}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      {label}
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  );
}

export const BranchLabelNode = memo(BranchLabelNodeComponent);
