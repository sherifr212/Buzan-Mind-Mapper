import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { BranchNode } from '@bmm/data-model';

// ─── BranchLabelNode ──────────────────────────────────────────────────────────
// Renders the keyword label for a branch node in the canvas.

export interface BranchLabelNodeData {
  branch: BranchNode;
}

function BranchLabelNodeComponent({ data }: NodeProps<BranchLabelNodeData>) {
  const { branch } = data;
  const label = branch.isUpperCase ? branch.keyword.toUpperCase() : branch.keyword;

  const fontSize = branch.depth === 0 ? 16 : branch.depth === 1 ? 13 : 11;
  const fontWeight = branch.depth === 0 ? 'bold' : 'normal';

  return (
    <div
      style={{
        color: branch.color,
        fontSize,
        fontWeight,
        whiteSpace: 'nowrap',
        padding: '2px 6px',
        background: 'transparent',
        userSelect: 'none',
        pointerEvents: 'none',
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
