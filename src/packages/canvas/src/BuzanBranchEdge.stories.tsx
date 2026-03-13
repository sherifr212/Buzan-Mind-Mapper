import type { Meta, StoryObj } from '@storybook/react';
import ReactFlow, { Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { BuzanBranchEdge } from './BuzanBranchEdge';
import type { BranchNode } from '@bmm/data-model';

// ─── BuzanBranchEdge Stories ──────────────────────────────────────────────────
// AT-RE-002: Branches default to curved Bézier paths [VISUAL]

const edgeTypes = { buzanBranch: BuzanBranchEdge };

const SimpleNode = () => (
  <div style={{ width: 60, height: 30, background: '#eee', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Handle type="source" position={Position.Right} />
    <Handle type="target" position={Position.Left} />
    Node
  </div>
);

const nodeTypes = { simple: SimpleNode };

function boiBranch(overrides?: Partial<BranchNode>): BranchNode {
  return {
    id: 'b1',
    parentId: null,
    keyword: 'Innovation',
    isUpperCase: true,
    color: '#E53935',
    lineThickness: 5,
    isCurved: true,
    length: 80,
    angle: 0,
    depth: 0,
    image: null,
    hasBoundary: false,
    boundaryShape: null,
    numericalOrder: null,
    codes: [],
    blankLine: false,
    linkedMapId: null,
    ...overrides,
  };
}

function BranchEdgeStory({ branch }: { branch: BranchNode }) {
  return (
    <div style={{ width: 800, height: 300 }}>
      <ReactFlow
        nodes={[
          { id: 'source', type: 'simple', position: { x: 100, y: 120 }, data: {} },
          { id: 'target', type: 'simple', position: { x: 600, y: 120 }, data: {} },
        ]}
        edges={[
          {
            id: 'e1',
            source: 'source',
            target: 'target',
            type: 'buzanBranch',
            data: { branch },
          },
        ]}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      />
    </div>
  );
}

const meta: Meta<typeof BranchEdgeStory> = {
  title: 'Canvas/BuzanBranchEdge',
  component: BranchEdgeStory,
  parameters: {
    chromatic: { viewports: [1280] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** AT-RE-002: BOI branch — thick curved Bézier, red */
export const BOIBranch: Story = {
  args: { branch: boiBranch() },
};

/** Depth-1 sub-branch — medium thickness */
export const Depth1Branch: Story = {
  args: { branch: boiBranch({ depth: 1, color: '#43A047', lineThickness: 2.5, keyword: 'Strategy' }) },
};

/** Depth-2+ sub-branch — thin line */
export const Depth2Branch: Story = {
  args: { branch: boiBranch({ depth: 2, color: '#1E88E5', lineThickness: 1, keyword: 'Detail' }) },
};
