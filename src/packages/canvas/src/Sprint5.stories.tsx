import type { Meta, StoryObj } from '@storybook/react';
import { BuzanCanvas } from './BuzanCanvas';
import type { MindMap, BranchNode } from '@bmm/data-model';

// ─── Sprint 5 Visual Stories ──────────────────────────────────────────────────
// AT-LE-030: BOI keywords visually larger than sub-branch keywords [VISUAL]
// AT-LE-031: Branch line thickness decreases with depth [VISUAL]
// AT-LE-065: Central branches always visually thicker [VISUAL]
// AT-TY-001: Default font is printed sans-serif [VISUAL]
// AT-TY-003: Font size decreases with branch depth [VISUAL]
// AT-TY-005: Keywords stay upright on steep branches [VISUAL]

const centralImage = {
  id: 'ci',
  type: 'text-image' as const,
  src: 'FOCUS',
  colors: ['#E53935', '#43A047', '#1E88E5'],
  hasDimension: true,
  position: { x: 910, y: 490 },
  size: { width: 120, height: 120 },
};

function makeMap(branches: BranchNode[]): MindMap {
  return {
    id: 'story-map',
    title: 'Story Map',
    centralImage,
    bois: branches.filter((b) => b.parentId === null),
    orientation: 'LANDSCAPE',
    canvasSize: { width: 1920, height: 1080 },
    colorPalette: ['#E53935', '#43A047', '#1E88E5', '#FB8C00', '#8E24AA'],
    branches,
    arrows: [],
    numericalOrder: [],
    createdAt: '2026-03-13T00:00:00.000Z',
    updatedAt: '2026-03-13T00:00:00.000Z',
    reviewSchedule: null,
    tags: [],
    isGroupMap: false,
    linkedMaps: [],
    participants: [],
  };
}

function makeBranch(overrides: Partial<BranchNode> & Pick<BranchNode, 'id' | 'keyword' | 'color' | 'depth' | 'parentId' | 'angle'>): BranchNode {
  return {
    isUpperCase: overrides.depth === 0,
    lineThickness: overrides.depth === 0 ? 5 : overrides.depth === 1 ? 2.5 : 1,
    isCurved: true,
    length: 80,
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

// ─── Hierarchy Depth Story ────────────────────────────────────────────────────
// Demonstrates AT-LE-030, AT-LE-031, AT-LE-065, AT-TY-003: sizes decrease with depth.
const hierarchyBranches: BranchNode[] = [
  makeBranch({ id: 'b1', parentId: null, keyword: 'Learning', color: '#E53935', depth: 0, angle: 0 }),
  makeBranch({ id: 'b1-1', parentId: 'b1', keyword: 'Practice', color: '#E53935', depth: 1, angle: 0 }),
  makeBranch({ id: 'b1-1-1', parentId: 'b1-1', keyword: 'Daily', color: '#E53935', depth: 2, angle: 0 }),
  makeBranch({ id: 'b2', parentId: null, keyword: 'Teaching', color: '#43A047', depth: 0, angle: Math.PI * 0.5 }),
  makeBranch({ id: 'b2-1', parentId: 'b2', keyword: 'Mentor', color: '#43A047', depth: 1, angle: Math.PI * 0.5 }),
];

// ─── Mixed Depth Story ────────────────────────────────────────────────────────
const mixedDepthBranches: BranchNode[] = [
  makeBranch({ id: 'm1', parentId: null, keyword: 'Goals', color: '#E53935', depth: 0, angle: 0 }),
  makeBranch({ id: 'm2', parentId: null, keyword: 'Actions', color: '#43A047', depth: 0, angle: (Math.PI * 2) / 5 }),
  makeBranch({ id: 'm3', parentId: null, keyword: 'Review', color: '#1E88E5', depth: 0, angle: (Math.PI * 4) / 5 }),
  makeBranch({ id: 'm4', parentId: null, keyword: 'Adjust', color: '#FB8C00', depth: 0, angle: (Math.PI * 6) / 5 }),
  makeBranch({ id: 'm5', parentId: null, keyword: 'Celebrate', color: '#8E24AA', depth: 0, angle: (Math.PI * 8) / 5 }),
  makeBranch({ id: 'm1-1', parentId: 'm1', keyword: 'Short', color: '#E53935', depth: 1, angle: 0 }),
  makeBranch({ id: 'm1-2', parentId: 'm1', keyword: 'Long', color: '#E53935', depth: 1, angle: 0.4 }),
  makeBranch({ id: 'm1-1-1', parentId: 'm1-1', keyword: 'Week', color: '#E53935', depth: 2, angle: 0 }),
];

// ─── Colour Inheritance Story ─────────────────────────────────────────────────
// AT-LE-022: colour inherited from BOI to all descendants.
const colourBranches: BranchNode[] = [
  makeBranch({ id: 'c1', parentId: null, keyword: 'Red', color: '#E53935', depth: 0, angle: 0 }),
  makeBranch({ id: 'c1-1', parentId: 'c1', keyword: 'Child', color: '#E53935', depth: 1, angle: 0 }),
  makeBranch({ id: 'c1-1-1', parentId: 'c1-1', keyword: 'Leaf', color: '#E53935', depth: 2, angle: 0 }),
  makeBranch({ id: 'c2', parentId: null, keyword: 'Blue', color: '#1E88E5', depth: 0, angle: (Math.PI * 2) / 3 }),
  makeBranch({ id: 'c2-1', parentId: 'c2', keyword: 'Child', color: '#1E88E5', depth: 1, angle: (Math.PI * 2) / 3 }),
  makeBranch({ id: 'c3', parentId: null, keyword: 'Green', color: '#43A047', depth: 0, angle: (Math.PI * 4) / 3 }),
  makeBranch({ id: 'c3-1', parentId: 'c3', keyword: 'Child', color: '#43A047', depth: 1, angle: (Math.PI * 4) / 3 }),
];

// ─── Upright Keywords Story ───────────────────────────────────────────────────
// AT-TY-005: branches in lower half (angle > π) have flipped labels.
const uprightBranches: BranchNode[] = [
  makeBranch({ id: 'u1', parentId: null, keyword: 'Right', color: '#E53935', depth: 0, angle: 0 }),
  makeBranch({ id: 'u2', parentId: null, keyword: 'Upper', color: '#43A047', depth: 0, angle: Math.PI * 0.5 }),
  makeBranch({ id: 'u3', parentId: null, keyword: 'Left', color: '#1E88E5', depth: 0, angle: Math.PI }),
  makeBranch({ id: 'u4', parentId: null, keyword: 'Lower', color: '#FB8C00', depth: 0, angle: Math.PI * 1.5 }),
  makeBranch({ id: 'u5', parentId: null, keyword: 'LowerLeft', color: '#8E24AA', depth: 0, angle: Math.PI * (250 / 180) }),
];

const meta: Meta<typeof BuzanCanvas> = {
  title: 'Canvas/Sprint5',
  component: BuzanCanvas,
  parameters: {
    chromatic: { viewports: [1920] },
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/** AT-LE-030 / AT-LE-031 / AT-LE-065 / AT-TY-003 — sizes and thickness decrease with depth */
export const HierarchyDepth: Story = {
  args: { map: makeMap(hierarchyBranches) },
  name: 'Hierarchy — Depth Visual (AT-LE-030/031/065, AT-TY-003)',
};

/** Mixed depth map with 5 BOIs, sub-branches, and leaves */
export const MixedDepth: Story = {
  args: { map: makeMap(mixedDepthBranches) },
  name: 'Mixed-Depth Map',
};

/** AT-LE-022 — colour inherits from BOI to all descendants */
export const ColourInheritance: Story = {
  args: { map: makeMap(colourBranches) },
  name: 'Colour Inheritance (AT-LE-022)',
};

/** AT-TY-005 — keywords in lower half flip to stay upright */
export const UprightKeywords: Story = {
  args: { map: makeMap(uprightBranches) },
  name: 'Upright Keywords — Angle Flip (AT-TY-005)',
};
