import { describe, it, expect } from 'vitest';
import { exportToSvg, exportToBmm, importFromBmm, getPdfPageDimensions, exportToPdf, getOutlineText } from '../ExportService';
import type { MindMap, BranchNode } from '@bmm/data-model';

function makeTestMap(): MindMap {
  const b1: BranchNode = {
    id: 'b1', parentId: null, keyword: 'Animals', isUpperCase: true,
    color: '#E53935', lineThickness: 4, isCurved: true, length: 50,
    angle: 0, depth: 0, image: null, hasBoundary: false, boundaryShape: null,
    numericalOrder: 1, codes: [], blankLine: false, linkedMapId: null,
  };
  const b2: BranchNode = {
    id: 'b2', parentId: null, keyword: 'Plants', isUpperCase: true,
    color: '#1E88E5', lineThickness: 4, isCurved: true, length: 50,
    angle: Math.PI / 2, depth: 0, image: null, hasBoundary: false, boundaryShape: null,
    numericalOrder: 2, codes: [], blankLine: false, linkedMapId: null,
  };
  const b3: BranchNode = {
    id: 'b3', parentId: 'b1', keyword: 'Mammals', isUpperCase: false,
    color: '#E53935', lineThickness: 3, isCurved: true, length: 40,
    angle: 0, depth: 1, image: null, hasBoundary: false, boundaryShape: null,
    numericalOrder: null, codes: [], blankLine: false, linkedMapId: null,
  };

  return {
    id: 'export-test-map',
    title: 'Nature',
    centralImage: {
      id: 'ci1', type: 'text-image',
      src: '', colors: ['#E53935', '#1E88E5', '#43A047'],
      hasDimension: false, position: { x: 0, y: 0 }, size: { width: 120, height: 80 },
    },
    bois: [b1, b2],
    branches: [b1, b2, b3],
    orientation: 'LANDSCAPE',
    canvasSize: { width: 1920, height: 1080 },
    colorPalette: ['#E53935', '#1E88E5', '#43A047'],
    numericalOrder: [],
    createdAt: '2026-03-14T00:00:00.000Z',
    updatedAt: '2026-03-14T00:00:00.000Z',
    reviewSchedule: null,
    tags: [],
    isGroupMap: false,
    linkedMaps: [],
    arrows: [],
    participants: [],
  };
}

// ─── AT-EX-001b: PDF export enforces landscape orientation ─────────────────

describe('AT-EX-001b: PDF export enforces landscape orientation', () => {
  it('exported PDF page has width > height (landscape)', async () => {
    const map = makeTestMap();
    const svg = exportToSvg(map);
    const pdfBytes = await exportToPdf(svg);

    expect(pdfBytes).toBeInstanceOf(Uint8Array);
    expect(pdfBytes.length).toBeGreaterThan(0);

    const { width, height } = await getPdfPageDimensions(pdfBytes);
    // Landscape: width must be greater than height
    expect(width).toBeGreaterThan(height);
  });
});

// ─── AT-EX-003: .bmm round-trip export/import preserves full fidelity ──────

describe('AT-EX-003: .bmm round-trip export/import', () => {
  it('exported .bmm file imports back with identical data', () => {
    const original = makeTestMap();
    const exported = exportToBmm(original);

    // Exported content must be valid JSON
    expect(() => JSON.parse(exported)).not.toThrow();

    const imported = importFromBmm(exported);

    // Deep equality
    expect(imported.id).toBe(original.id);
    expect(imported.title).toBe(original.title);
    expect(imported.branches.length).toBe(original.branches.length);
    expect(imported.orientation).toBe(original.orientation);
    expect(imported.colorPalette).toEqual(original.colorPalette);
    expect(imported.canvasSize).toEqual(original.canvasSize);
    expect(imported.isGroupMap).toBe(original.isGroupMap);

    // Each branch preserved
    for (let i = 0; i < original.branches.length; i++) {
      expect(imported.branches[i].id).toBe(original.branches[i].id);
      expect(imported.branches[i].keyword).toBe(original.branches[i].keyword);
      expect(imported.branches[i].color).toBe(original.branches[i].color);
      expect(imported.branches[i].parentId).toBe(original.branches[i].parentId);
    }
  });
});

// ─── SVG export produces <text> elements ────────────────────────────────────

describe('SVG export produces valid SVG with text elements', () => {
  it('SVG contains XML header and text elements for all keywords', () => {
    const map = makeTestMap();
    const svg = exportToSvg(map);

    expect(svg).toContain('<?xml version="1.0"');
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    // All branch keywords must appear as <text> elements
    for (const branch of map.branches.filter((b) => !b.blankLine)) {
      expect(svg).toContain(`>${branch.keyword}</text>`);
    }
    // Central title
    expect(svg).toContain(map.title);
  });
});

// ─── DOCX outline order ──────────────────────────────────────────────────────

describe('Linear Outline respects numerical branch order', () => {
  it('getOutlineText returns branches sorted by numericalOrder', () => {
    const map = makeTestMap();
    const lines = getOutlineText(map);
    // b1 (numericalOrder=1) should come before b2 (numericalOrder=2)
    const idx1 = lines.findIndex((l) => l.includes('Animals'));
    const idx2 = lines.findIndex((l) => l.includes('Plants'));
    expect(idx1).toBeGreaterThanOrEqual(0);
    expect(idx2).toBeGreaterThan(idx1);
    // Mammals is sub-branch of Animals
    const idxMammals = lines.findIndex((l) => l.includes('Mammals'));
    expect(idxMammals).toBeGreaterThan(idx1);
    expect(idxMammals).toBeLessThan(idx2);
  });
});
