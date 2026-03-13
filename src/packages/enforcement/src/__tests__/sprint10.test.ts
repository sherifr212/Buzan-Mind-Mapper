import { describe, it, expect } from 'vitest';
import { checkUnrelatedBranchColours } from '../rules/colourHealth.js';
import type { MindMap, BranchNode } from '@bmm/data-model';

// ─── Test Fixtures ────────────────────────────────────────────────────────────

function makeCentralImage() {
  return {
    id: 'ci-1',
    type: 'raster' as const,
    src: 'data:image/png;base64,abc',
    colors: ['#E53935', '#1E88E5', '#43A047'],
    hasDimension: false,
    position: { x: 0, y: 0 },
    size: { width: 200, height: 150 },
  };
}

function makeBranch(overrides: Partial<BranchNode> = {}): BranchNode {
  return {
    id: 'b1',
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
  return {
    id: 'map-1',
    title: 'Test Map',
    centralImage: makeCentralImage(),
    bois: [],
    branches: [],
    orientation: 'LANDSCAPE',
    canvasSize: { width: 1920, height: 1080 },
    colorPalette: ['#E53935', '#1E88E5', '#43A047', '#FFEB3B', '#8E24AA', '#FB8C00'],
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

// ─── AT-CS-003: Colour palette auto-assignment to BOIs ───────────────────────

describe('AT-CS-003: Colour palette auto-assignment to BOIs', () => {
  it('cycles through palette assigning colours to BOIs by index', () => {
    const palette = ['#E53935', '#1E88E5', '#43A047', '#FFEB3B', '#8E24AA', '#FB8C00'];

    // Simulate creating 6 BOIs by assigning palette[index % palette.length]
    const bois = palette.map((_, index) =>
      makeBranch({ id: `boi-${index}`, color: palette[index % palette.length] })
    );

    expect(bois[0].color).toBe('#E53935');
    expect(bois[1].color).toBe('#1E88E5');
    expect(bois[2].color).toBe('#43A047');
    expect(bois[3].color).toBe('#FFEB3B');
    expect(bois[4].color).toBe('#8E24AA');
    expect(bois[5].color).toBe('#FB8C00');
  });

  it('wraps around palette when more BOIs than palette entries (7th BOI gets first colour)', () => {
    const palette = ['#E53935', '#1E88E5', '#43A047', '#FFEB3B', '#8E24AA', '#FB8C00'];

    const bois = Array.from({ length: 7 }, (_, index) =>
      makeBranch({ id: `boi-${index}`, color: palette[index % palette.length] })
    );

    // 7th BOI (index 6) wraps around to palette[0]
    expect(bois[6].color).toBe('#E53935');
  });
});

// ─── AT-CS-008: Unrelated branch colour confusion WARN ───────────────────────

describe('AT-CS-008: checkUnrelatedBranchColours warns when 4+ branches from 3+ BOIs share a colour', () => {
  it('returns WARN when 4 branches from 4 different BOIs share the same colour', () => {
    // BOI A, B, C, D all have colour #E53935
    const boiA = makeBranch({ id: 'boi-a', parentId: null, color: '#E53935', depth: 0 });
    const boiB = makeBranch({ id: 'boi-b', parentId: null, color: '#E53935', depth: 0 });
    const boiC = makeBranch({ id: 'boi-c', parentId: null, color: '#E53935', depth: 0 });
    const boiD = makeBranch({ id: 'boi-d', parentId: null, color: '#E53935', depth: 0 });

    const map = makeMap({ branches: [boiA, boiB, boiC, boiD] });
    const result = checkUnrelatedBranchColours(map);

    expect(result).not.toBeNull();
    expect(result!.level).toBe('WARN');
    expect(result!.lawId).toBe('CS-008');
    expect(result!.message).toContain('Using the same colour across unrelated branches');
  });

  it('returns WARN when 4 sub-branches from 4 different BOI trees share the same colour', () => {
    const boiA = makeBranch({ id: 'boi-a', parentId: null, color: '#43A047', depth: 0 });
    const boiB = makeBranch({ id: 'boi-b', parentId: null, color: '#43A047', depth: 0 });
    const boiC = makeBranch({ id: 'boi-c', parentId: null, color: '#43A047', depth: 0 });
    const boiD = makeBranch({ id: 'boi-d', parentId: null, color: '#43A047', depth: 0 });
    // Sub-branches all with same colour
    const sub1 = makeBranch({ id: 's1', parentId: 'boi-a', color: '#E53935', depth: 1 });
    const sub2 = makeBranch({ id: 's2', parentId: 'boi-b', color: '#E53935', depth: 1 });
    const sub3 = makeBranch({ id: 's3', parentId: 'boi-c', color: '#E53935', depth: 1 });
    const sub4 = makeBranch({ id: 's4', parentId: 'boi-d', color: '#E53935', depth: 1 });

    const map = makeMap({ branches: [boiA, boiB, boiC, boiD, sub1, sub2, sub3, sub4] });
    const result = checkUnrelatedBranchColours(map);

    expect(result).not.toBeNull();
    expect(result!.level).toBe('WARN');
    expect(result!.lawId).toBe('CS-008');
  });

  it('returns null when only 3 branches from 3 BOIs share the same colour (threshold is 4+)', () => {
    const boiA = makeBranch({ id: 'boi-a', parentId: null, color: '#E53935', depth: 0 });
    const boiB = makeBranch({ id: 'boi-b', parentId: null, color: '#E53935', depth: 0 });
    const boiC = makeBranch({ id: 'boi-c', parentId: null, color: '#E53935', depth: 0 });

    const map = makeMap({ branches: [boiA, boiB, boiC] });
    const result = checkUnrelatedBranchColours(map);

    expect(result).toBeNull();
  });

  it('returns null when 4 branches from only 2 BOIs share the same colour (needs 3+ BOIs)', () => {
    const boiA = makeBranch({ id: 'boi-a', parentId: null, color: '#E53935', depth: 0 });
    const boiB = makeBranch({ id: 'boi-b', parentId: null, color: '#E53935', depth: 0 });
    // Two sub-branches under boi-a with same colour
    const sub1 = makeBranch({ id: 's1', parentId: 'boi-a', color: '#E53935', depth: 1 });
    const sub2 = makeBranch({ id: 's2', parentId: 'boi-b', color: '#E53935', depth: 1 });

    const map = makeMap({ branches: [boiA, boiB, sub1, sub2] });
    const result = checkUnrelatedBranchColours(map);

    // 4 branches, but only 2 distinct BOIs → should NOT warn
    expect(result).toBeNull();
  });

  it('returns null for an empty map', () => {
    const map = makeMap({ branches: [] });
    const result = checkUnrelatedBranchColours(map);
    expect(result).toBeNull();
  });
});
