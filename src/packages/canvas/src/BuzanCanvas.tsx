import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import type { Node, Edge } from 'reactflow';
import { useMemo } from 'react';
import type { MindMap, BranchNode } from '@bmm/data-model';
import { computeLayout } from './layout';
import { CentralImageNode } from './CentralImageNode';
import { BranchLabelNode } from './BranchLabelNode';
import { BuzanBranchEdge } from './BuzanBranchEdge';
import { Position } from 'reactflow';

// ─── BuzanCanvas ──────────────────────────────────────────────────────────────
// Main read-only canvas component.
// RE-004: landscape orientation enforced (width > height).
// RE-020: Central Image at geometric centre.
// RE-023: BOI branches connect from Central Image boundary handles.

const nodeTypes = {
  centralImage: CentralImageNode,
  branchLabel: BranchLabelNode,
};

const edgeTypes = {
  buzanBranch: BuzanBranchEdge,
};

/** Selects the Central Image boundary handle closest to a given angle. */
function pickHandleId(angle: number): string {
  // Normalise angle to [0, 2π)
  const a = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  if (a < Math.PI / 4 || a >= (7 * Math.PI) / 4) return 'right';
  if (a < (3 * Math.PI) / 4) return 'bottom';
  if (a < (5 * Math.PI) / 4) return 'left';
  return 'top';
}

/** Selects the source position that matches the handle id. */
function handleToPosition(handleId: string): Position {
  switch (handleId) {
    case 'right': return Position.Right;
    case 'bottom': return Position.Bottom;
    case 'left': return Position.Left;
    case 'top': return Position.Top;
    default: return Position.Right;
  }
}

export interface BuzanCanvasProps {
  map: MindMap;
}

export function BuzanCanvas({ map }: BuzanCanvasProps) {
  const { canvasSize, centralImage } = map;

  const { nodes, edges } = useMemo(() => {
    const positions = computeLayout(map, canvasSize.width, canvasSize.height);
    const centreX = canvasSize.width / 2;
    const centreY = canvasSize.height / 2;

    // Central image node — positioned so its centre aligns with canvas centre
    const ciNode: Node = {
      id: 'central-image',
      type: 'centralImage',
      position: {
        x: centreX - centralImage.size.width / 2,
        y: centreY - centralImage.size.height / 2,
      },
      data: { image: centralImage, canvasWidth: canvasSize.width, canvasHeight: canvasSize.height },
      draggable: false,
    };

    // Branch nodes — pass angle so BranchLabelNode can flip text (AT-TY-005)
    const branchNodes: Node[] = map.branches.map((branch: BranchNode) => {
      const pos = positions.get(branch.id) ?? { id: branch.id, x: centreX, y: centreY };
      return {
        id: branch.id,
        type: 'branchLabel',
        position: { x: pos.x, y: pos.y },
        data: { branch, angle: branch.angle },
        draggable: false,
      };
    });

    // Edges — BOI branches connect from Central Image boundary handles
    const branchEdges: Edge[] = map.branches.map((branch: BranchNode) => {
      const isBoi = branch.parentId === null;
      const sourceId = isBoi ? 'central-image' : branch.parentId!;
      const handleId = isBoi ? pickHandleId(branch.angle) : 'right';
      const sourcePos = isBoi ? handleToPosition(handleId) : Position.Right;

      return {
        id: `edge-${branch.id}`,
        source: sourceId,
        target: branch.id,
        sourceHandle: isBoi ? handleId : undefined,
        type: 'buzanBranch',
        data: { branch },
        sourcePosition: sourcePos,
        targetPosition: Position.Left,
      };
    });

    return {
      nodes: [ciNode, ...branchNodes],
      edges: branchEdges,
    };
  }, [map, canvasSize, centralImage]);

  return (
    <div
      style={{
        width: canvasSize.width,
        height: canvasSize.height,
        background: '#ffffff',
      }}
      data-testid="canvas-ready"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
