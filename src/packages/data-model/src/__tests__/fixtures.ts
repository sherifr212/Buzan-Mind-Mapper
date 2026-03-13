import type { MindMap, BranchNode, ImageNode, Arrow, ReviewSchedule } from '../types.js';

// ─── Test Fixtures ────────────────────────────────────────────────────────────

export function makeCentralImage(overrides: Partial<ImageNode> = {}): ImageNode {
  return {
    id: 'central-image-1',
    type: 'raster',
    src: 'data:image/png;base64,abc',
    colors: ['#E53935', '#1E88E5', '#43A047'],
    hasDimension: false,
    position: { x: 0, y: 0 },
    size: { width: 200, height: 150 },
    ...overrides,
  };
}

export function makeBranch(overrides: Partial<BranchNode> = {}): BranchNode {
  return {
    id: 'branch-1',
    parentId: null,
    keyword: 'Ideas',
    isUpperCase: true,
    color: '#E53935',
    lineThickness: 4,
    isCurved: true,
    length: 50,
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

export function makeArrow(overrides: Partial<Arrow> = {}): Arrow {
  return {
    id: 'arrow-1',
    sourceNodeId: 'branch-1',
    targetNodeId: 'branch-2',
    directionality: 'UNI',
    arrowStyle: { size: 1, form: 'solid', dimension: false },
    label: null,
    color: '#000000',
    ...overrides,
  };
}

export function makeReviewSchedule(overrides: Partial<ReviewSchedule> = {}): ReviewSchedule {
  return {
    intervals: [20, 1440, 10080, 43200, 129600, 259200],
    completed: [false, false, false, false, false, false],
    nextReviewAt: new Date().toISOString(),
    ...overrides,
  };
}

export function makeMindMap(overrides: Partial<MindMap> = {}): MindMap {
  const branch1 = makeBranch({ id: 'branch-1', parentId: null, color: '#E53935', depth: 0 });
  const branch2 = makeBranch({ id: 'branch-2', parentId: null, color: '#1E88E5', depth: 0 });

  return {
    id: 'map-1',
    title: 'Test Map',
    centralImage: makeCentralImage(),
    bois: [branch1, branch2],
    branches: [branch1, branch2],
    orientation: 'LANDSCAPE',
    canvasSize: { width: 1920, height: 1080 },
    colorPalette: ['#E53935', '#1E88E5', '#43A047'],
    numericalOrder: [],
    createdAt: '2026-03-13T00:00:00.000Z',
    updatedAt: '2026-03-13T00:00:00.000Z',
    reviewSchedule: makeReviewSchedule(),
    tags: [],
    isGroupMap: false,
    linkedMaps: [],
    arrows: [],
    participants: [],
    ...overrides,
  };
}
