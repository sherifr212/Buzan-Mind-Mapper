import { describe, it, expect } from 'vitest';
import { EnforcementEngine } from '../EnforcementEngine.js';
import {
  checkCentralImage,
  checkCentralImageColours,
  checkDuplicateBoiColours,
  checkMinimumColours,
  checkColourInheritance,
  computeImageDensityRatio,
} from '../rules/emphasis.js';
import type { MindMap, BranchNode } from '@bmm/data-model';

// ─── Test Fixtures ────────────────────────────────────────────────────────────

function makeCentralImage(colors: string[] = ['#E53935', '#1E88E5', '#43A047']) {
  return {
    id: 'ci-1',
    type: 'raster' as const,
    src: 'data:image/png;base64,abc',
    colors,
    hasDimension: false,
    position: { x: 0, y: 0 },
    size: { width: 200, height: 150 },
  };
}

function makeBranch(overrides: Partial<BranchNode> = {}): BranchNode {
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

function makeMap(overrides: Partial<MindMap> = {}): MindMap {
  const b1 = makeBranch({ id: 'b1', color: '#E53935' });
  const b2 = makeBranch({ id: 'b2', color: '#1E88E5' });
  return {
    id: 'map-1',
    title: 'Test Map',
    centralImage: makeCentralImage(),
    bois: [b1, b2],
    branches: [b1, b2],
    orientation: 'LANDSCAPE',
    canvasSize: { width: 1920, height: 1080 },
    colorPalette: ['#E53935', '#1E88E5', '#43A047'],
    numericalOrder: [],
    createdAt: '2026-03-13T00:00:00.000Z',
    updatedAt: '2026-03-13T00:00:00.000Z',
    reviewSchedule: null,
    tags: [],
    isGroupMap: false,
    linkedMaps: [],
    arrows: [],
    participants: [],
    ...overrides,
  };
}

const engine = new EnforcementEngine();
const noopEvent = { type: 'CREATE_BRANCH' as const };

// ─── AT-LE-001 (unit): No Central Image → BLOCK ───────────────────────────────

describe('AT-LE-001(unit): New map blocked without a Central Image', () => {
  it('returns BLOCK when centralImage is missing', () => {
    const results = checkCentralImage({ centralImage: undefined as never });
    expect(results).toHaveLength(1);
    expect(results[0].level).toBe('BLOCK');
    expect(results[0].lawId).toBe('LE-001');
    expect(results[0].message).toContain('Every Mind Map begins with a Central Image');
  });

  it('returns no results when centralImage is present', () => {
    const results = checkCentralImage({ centralImage: makeCentralImage() });
    expect(results).toHaveLength(0);
  });
});

// ─── AT-LE-003: Central Image < 3 colours → WARN ─────────────────────────────

describe('AT-LE-003: Central Image with fewer than 3 colours triggers warning', () => {
  it('returns WARN when colorCount = 2', () => {
    const results = checkCentralImageColours({
      centralImage: makeCentralImage(['#E53935', '#1E88E5']),
    });
    expect(results).toHaveLength(1);
    expect(results[0].level).toBe('WARN');
    expect(results[0].lawId).toBe('LE-003');
    expect(results[0].message).toContain('Your Central Image uses only 2 colour(s)');
    expect(results[0].message).toContain('Buzan recommends 3 or more colours');
  });
});

// ─── AT-LE-003b: Central Image with 3 colours → no warning ───────────────────

describe('AT-LE-003b: Central Image with 3 colours passes validation', () => {
  it('returns no colour warning when colorCount = 3', () => {
    const results = checkCentralImageColours({
      centralImage: makeCentralImage(['#E53935', '#1E88E5', '#43A047']),
    });
    expect(results).toHaveLength(0);
  });
});

// ─── AT-LE-011: Image density ratio ──────────────────────────────────────────

describe('AT-LE-011: Image density ratio is tracked', () => {
  it('computes imageDensityRatio = 0.3 for 10 branches with 3 images', () => {
    const branches = Array.from({ length: 10 }, (_, i) =>
      makeBranch({
        id: `b${i}`,
        image: i < 3 ? makeCentralImage() : null,
      })
    );
    const ratio = computeImageDensityRatio({ branches });
    expect(ratio).toBeCloseTo(0.3, 5);
  });
});

// ─── AT-LE-020: Two BOIs same colour → BLOCK ─────────────────────────────────

describe('AT-LE-020: Two BOIs cannot share the same colour', () => {
  it('returns BLOCK when two BOIs have the same colour', () => {
    const branches = [
      makeBranch({ id: 'b1', parentId: null, color: '#E53935' }),
      makeBranch({ id: 'b2', parentId: null, color: '#E53935' }),
    ];
    const results = checkDuplicateBoiColours({ branches });
    expect(results).toHaveLength(1);
    expect(results[0].level).toBe('BLOCK');
    expect(results[0].lawId).toBe('LE-020');
    expect(results[0].message).toContain('Each BOI must have a unique colour');
  });

  it('returns no results when BOIs have different colours', () => {
    const branches = [
      makeBranch({ id: 'b1', parentId: null, color: '#E53935' }),
      makeBranch({ id: 'b2', parentId: null, color: '#1E88E5' }),
    ];
    const results = checkDuplicateBoiColours({ branches });
    expect(results).toHaveLength(0);
  });
});

// ─── AT-LE-021: Map < 3 colours → WARN ───────────────────────────────────────

describe('AT-LE-021: Map with fewer than 3 total colours triggers warning', () => {
  it('returns WARN when all branches use 1 colour and central image uses 2 colours', () => {
    const branches = [
      makeBranch({ id: 'b1', color: '#000000' }),
      makeBranch({ id: 'b2', color: '#000000' }),
    ];
    const centralImage = makeCentralImage(['#000000', '#111111']);
    const results = checkMinimumColours({ branches, centralImage });
    expect(results).toHaveLength(1);
    expect(results[0].level).toBe('WARN');
    expect(results[0].lawId).toBe('LE-021');
    expect(results[0].message).toContain(
      'Buzan identifies colour as one of the most powerful tools'
    );
  });

  it('returns no results when 3 or more distinct colours are used', () => {
    const branches = [
      makeBranch({ id: 'b1', color: '#E53935' }),
      makeBranch({ id: 'b2', color: '#1E88E5' }),
    ];
    const centralImage = makeCentralImage(['#E53935', '#1E88E5', '#43A047']);
    const results = checkMinimumColours({ branches, centralImage });
    expect(results).toHaveLength(0);
  });
});

// ─── AT-LE-022b: Colour inheritance on sub-branch creation ───────────────────

describe('AT-LE-022b: Colour inheritance is applied on sub-branch creation', () => {
  it('returns BLOCK if child branch colour differs from BOI colour', () => {
    const boi = makeBranch({ id: 'boi-1', parentId: null, color: '#1565C0' });
    const child = makeBranch({ id: 'child-1', parentId: 'boi-1', color: '#E53935' });
    const allBranches = [boi, child];
    const results = checkColourInheritance(child, allBranches);
    expect(results).toHaveLength(1);
    expect(results[0].level).toBe('BLOCK');
    expect(results[0].lawId).toBe('LE-022');
  });

  it('returns no results when child inherits BOI colour', () => {
    const boi = makeBranch({ id: 'boi-1', parentId: null, color: '#1565C0' });
    const child = makeBranch({ id: 'child-1', parentId: 'boi-1', color: '#1565C0' });
    const allBranches = [boi, child];
    const results = checkColourInheritance(child, allBranches);
    expect(results).toHaveLength(0);
  });
});

// ─── EnforcementEngine integration check ─────────────────────────────────────

describe('EnforcementEngine.check() — integration', () => {
  it('returns no violations for a valid map', () => {
    const map = makeMap();
    const results = engine.check(map, noopEvent);
    // Filter out non-BLOCK results to check the map is valid
    const blocks = results.filter((r) => r.level === 'BLOCK');
    expect(blocks).toHaveLength(0);
  });

  it('returns BLOCK when centralImage is missing', () => {
    const map = makeMap({ centralImage: undefined as never });
    const results = engine.check(map, noopEvent);
    const block = results.find((r) => r.lawId === 'LE-001');
    expect(block).toBeDefined();
    expect(block!.level).toBe('BLOCK');
  });
});
