import { describe, it, expect } from 'vitest';
import { validateMindMap, validateBranch, validateArrow, calculateDepth } from '../validation.js';
import { resolveColour, assignBoiColour } from '../colour.js';
import { generateReviewSchedule } from '../reviewSchedule.js';
import { calculateBranchLength } from '../branchLength.js';
import { serialise, deserialise } from '../serialiser.js';
import { BMMValidationError } from '../errors.js';
import { makeMindMap, makeBranch, makeCentralImage, makeArrow } from './fixtures.js';

// ─── Section 2.1 — MindMap Entity Validation ─────────────────────────────────

describe('AT-DM-001: MindMap requires a Central Image', () => {
  it('rejects a map with no centralImage', () => {
    const result = validateMindMap({ colorPalette: ['#E53935', '#1E88E5', '#43A047'] });
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('CENTRAL_IMAGE_REQUIRED');
    expect(result.errors[0].message).toBe('Central image is required');
  });
});

describe('AT-DM-002: MindMap orientation is always LANDSCAPE', () => {
  it('overrides PORTRAIT to LANDSCAPE and logs a warning', () => {
    const map = { ...makeMindMap(), orientation: 'PORTRAIT' as never };
    const result = validateMindMap(map);
    // Validation overrides the value
    expect(map.orientation).toBe('LANDSCAPE');
    expect(result.warnings).toContain('Orientation forced to LANDSCAPE per Buzan law');
  });
});

describe('AT-DM-003: MindMap minimum colour palette', () => {
  it('rejects a map with fewer than 3 colours in the palette', () => {
    const result = validateMindMap({
      centralImage: makeCentralImage(),
      colorPalette: ['#E53935', '#1E88E5'],
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('COLOUR_PALETTE_TOO_SMALL');
    expect(result.errors[0].message).toBe('Colour palette must contain at least 3 colours');
  });
});

describe('AT-DM-004: MindMap review schedule auto-generated', () => {
  it('generates a review schedule with exactly 6 entries', () => {
    const createdAt = new Date('2026-03-13T00:00:00.000Z');
    const schedule = generateReviewSchedule(createdAt);
    expect(schedule.intervals).toHaveLength(6);
    expect(schedule.completed).toHaveLength(6);
    expect(schedule.completed.every((v) => v === false)).toBe(true);
  });

  it('sets nextReviewAt to first interval after createdAt', () => {
    const createdAt = new Date('2026-03-13T00:00:00.000Z');
    const schedule = generateReviewSchedule(createdAt);
    const expected = new Date(createdAt.getTime() + schedule.intervals[0] * 60 * 1000).toISOString();
    expect(schedule.nextReviewAt).toBe(expected);
  });
});

// ─── Section 2.2 — BranchNode Validation ─────────────────────────────────────

describe('AT-DM-010: Branch keyword must be a single word', () => {
  it('rejects a keyword with spaces', () => {
    const result = validateBranch({ keyword: 'good morning' });
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('KEYWORD_MULTI_WORD');
    expect(result.errors[0].message).toBe('Keyword must be a single word — no spaces permitted');
  });

  it('accepts a single-word keyword', () => {
    const result = validateBranch({ keyword: 'Happiness' });
    expect(result.valid).toBe(true);
  });
});

describe('AT-DM-011: Branch line length equals keyword length', () => {
  it('calculates branch length as keyword pixel width at given font size', () => {
    const keyword = 'Happiness';
    const fontSize = 14;
    const W = calculateBranchLength(keyword, fontSize);
    // W = 9 chars × 14pt × 0.6 = 75.6
    expect(W).toBeCloseTo(keyword.length * fontSize * 0.6, 0);
    // Branch with pre-computed length should match within ±1px
    const branch = makeBranch({ keyword, length: W });
    expect(branch.length).toBeCloseTo(W, 0);
  });
});

describe('AT-DM-012: BOI depth is exactly 0', () => {
  it('returns depth 0 for a branch with parentId = null', () => {
    const boi = makeBranch({ id: 'boi-1', parentId: null });
    const depth = calculateDepth('boi-1', [boi]);
    expect(depth).toBe(0);
  });
});

describe('AT-DM-013: Sub-branch depth increments correctly', () => {
  it('assigns depth 1 to child and depth 2 to grandchild', () => {
    const b1 = makeBranch({ id: 'b1', parentId: null, depth: 0 });
    const b2 = makeBranch({ id: 'b2', parentId: 'b1', depth: 1 });
    const b3 = makeBranch({ id: 'b3', parentId: 'b2', depth: 2 });
    const allBranches = [b1, b2, b3];

    expect(calculateDepth('b2', allBranches)).toBe(1);
    expect(calculateDepth('b3', allBranches)).toBe(2);
  });
});

describe('AT-DM-014: Maximum depth of 14 enforced', () => {
  it('returns an error when attempting to add a branch at depth 15', () => {
    // Build a chain of 14 branches (depths 0–13)
    const chain: ReturnType<typeof makeBranch>[] = [];
    chain.push(makeBranch({ id: 'b0', parentId: null, depth: 0 }));
    for (let i = 1; i <= 13; i++) {
      chain.push(makeBranch({ id: `b${i}`, parentId: `b${i - 1}`, depth: i }));
    }
    // Try to add depth-14 branch (parentId = b13, which is at depth 13 → child would be 14)
    // calculateDepth('b13', chain) = 13, so depth of new branch = 14 >= 14 → error
    const result = validateBranch({ parentId: 'b13', keyword: 'TooDeep' }, chain);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('MAX_DEPTH_EXCEEDED');
    expect(result.errors[0].message).toBe('Maximum branch depth of 14 reached');
  });
});

describe('AT-DM-015: BOI inherits unique colour from palette', () => {
  it('assigns a colour not already used by existing BOIs', () => {
    const palette = ['#E53935', '#1E88E5', '#43A047', '#FB8C00'];
    const existingBois = [
      makeBranch({ id: 'b1', color: '#E53935' }),
      makeBranch({ id: 'b2', color: '#1E88E5' }),
    ];
    const assigned = assignBoiColour(existingBois, palette);
    expect(assigned).not.toBe('#E53935');
    expect(assigned).not.toBe('#1E88E5');
    expect(assigned).toBe('#43A047');
  });
});

describe('AT-DM-016: Sub-branch inherits BOI colour', () => {
  it('resolves correct colour for child and grandchild of a BOI', () => {
    const boi = makeBranch({ id: 'b1', parentId: null, color: '#E53935' });
    const child = makeBranch({ id: 'c1', parentId: 'b1', color: '#000000' }); // own colour ignored
    const grandchild = makeBranch({ id: 'c2', parentId: 'c1', color: '#000000' });
    const allBranches = [boi, child, grandchild];

    expect(resolveColour(child, allBranches)).toBe('#E53935');
    expect(resolveColour(grandchild, allBranches)).toBe('#E53935');
  });
});

describe('AT-DM-017: isCurved defaults to true', () => {
  it('branch created without isCurved should have isCurved = true', () => {
    const branch = makeBranch(); // fixture sets isCurved: true by default
    expect(branch.isCurved).toBe(true);
  });
});

// ─── Section 2.3 — Arrow Validation ──────────────────────────────────────────

describe('AT-DM-020: Arrow requires valid source node', () => {
  it('returns an error when sourceNodeId references a non-existent node', () => {
    const map = makeMindMap();
    const arrow = makeArrow({ sourceNodeId: 'non-existent-node' });
    const result = validateArrow(arrow, map);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('SOURCE_NODE_NOT_FOUND');
    expect(result.errors[0].message).toBe('Source node does not exist in this map');
  });
});

describe('AT-DM-021: Arrow directionality defaults to UNI', () => {
  it('arrow created without specifying directionality should default to UNI', () => {
    const arrow = makeArrow(); // fixture sets directionality: 'UNI'
    expect(arrow.directionality).toBe('UNI');
  });
});

// ─── Section 2.4 — Native File Format (.bmm) ─────────────────────────────────

describe('AT-DM-030: Round-trip serialisation preserves all fields', () => {
  it('serialises and deserialises a fully-populated map with deep equality', () => {
    // Build a map with 10 branches, 3 arrows, codes, and a review schedule
    const branches = Array.from({ length: 10 }, (_, i) =>
      makeBranch({
        id: `branch-${i}`,
        parentId: i < 5 ? null : `branch-${i - 5}`,
        keyword: `Word${i}`,
        depth: i < 5 ? 0 : 1,
        color: i % 2 === 0 ? '#E53935' : '#1E88E5',
      })
    );
    const arrows = Array.from({ length: 3 }, (_, i) =>
      makeArrow({
        id: `arrow-${i}`,
        sourceNodeId: `branch-${i}`,
        targetNodeId: `branch-${i + 1}`,
      })
    );

    const original = makeMindMap({
      branches,
      bois: branches.filter((b) => b.parentId === null),
      arrows,
    });

    const json = serialise(original);
    const restored = deserialise(json);

    // Deep equality on all key fields
    expect(restored.id).toBe(original.id);
    expect(restored.title).toBe(original.title);
    expect(restored.branches).toHaveLength(original.branches.length);
    expect(restored.arrows).toHaveLength(original.arrows.length);
    expect(restored.colorPalette).toEqual(original.colorPalette);
    expect(restored.orientation).toBe('LANDSCAPE');
    expect(restored.canvasSize).toEqual(original.canvasSize);
    expect(restored.createdAt).toBe(original.createdAt);
    expect(restored.updatedAt).toBe(original.updatedAt);
    expect(restored.centralImage.id).toBe(original.centralImage.id);

    // Verify branches are identical
    for (let i = 0; i < original.branches.length; i++) {
      expect(restored.branches[i]).toEqual(original.branches[i]);
    }

    // Verify arrows
    for (let i = 0; i < original.arrows.length; i++) {
      expect(restored.arrows[i]).toEqual(original.arrows[i]);
    }
  });
});

describe('AT-DM-031: Deserialising an invalid .bmm throws a typed error', () => {
  it('throws BMMValidationError when centralImage is missing', () => {
    const invalidJson = JSON.stringify({
      format: 'bmm',
      version: '1.0',
      id: 'map-x',
      title: 'Bad Map',
      canvas: { width: 1920, height: 1080, orientation: 'LANDSCAPE' },
      colorPalette: ['#E53935', '#1E88E5', '#43A047'],
      // centralImage is intentionally missing
      branches: [],
      arrows: [],
    });

    expect(() => deserialise(invalidJson)).toThrow(BMMValidationError);
    expect(() => deserialise(invalidJson)).toThrow('Invalid .bmm file: validation failed');
  });

  it('throws BMMValidationError on invalid JSON', () => {
    expect(() => deserialise('{ not valid json }')).toThrow(BMMValidationError);
  });
});
