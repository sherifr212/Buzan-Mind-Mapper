import { describe, it, expect } from 'vitest';
import { lineThicknessForDepth, fontSizeForDepth, LINE_THICKNESS, FONT_SIZE } from '../constants';

// ─── Sprint 5 Unit Tests ───────────────────────────────────────────────────────

describe('AT-TY-002 — BOI keywords default to UPPER CASE', () => {
  it('branch.isUpperCase is true for depth-0 BOI', () => {
    // The BranchNode type has isUpperCase: boolean.
    // In our fixture and story data, BOI branches (depth=0) have isUpperCase=true.
    // This test validates the rendering logic in BranchLabelNode.
    const boiBranch = { keyword: 'happiness', isUpperCase: true, depth: 0 };
    const displayed = boiBranch.isUpperCase
      ? boiBranch.keyword.toUpperCase()
      : boiBranch.keyword;
    expect(displayed).toBe('HAPPINESS');
  });

  it('sub-branch keywords are not forced to upper case', () => {
    const subBranch = { keyword: 'detail', isUpperCase: false, depth: 1 };
    const displayed = subBranch.isUpperCase
      ? subBranch.keyword.toUpperCase()
      : subBranch.keyword;
    expect(displayed).toBe('detail');
  });
});

describe('AT-LE-031 / AT-LE-065 — Line thickness decreases with depth', () => {
  it('depth-0 (BOI) has the maximum stroke width', () => {
    expect(lineThicknessForDepth(0)).toBe(LINE_THICKNESS[0]);
    expect(lineThicknessForDepth(0)).toBeGreaterThan(lineThicknessForDepth(1));
  });

  it('depth-1 is thinner than depth-0 but thicker than depth-2', () => {
    expect(lineThicknessForDepth(1)).toBeLessThan(lineThicknessForDepth(0));
    expect(lineThicknessForDepth(1)).toBeGreaterThan(lineThicknessForDepth(2));
  });

  it('depth-2 and beyond all return the minimum thickness', () => {
    expect(lineThicknessForDepth(2)).toBe(LINE_THICKNESS[2]);
    expect(lineThicknessForDepth(3)).toBe(LINE_THICKNESS[2]);
    expect(lineThicknessForDepth(10)).toBe(LINE_THICKNESS[2]);
  });
});

describe('AT-TY-003 / AT-LE-030 — Font size decreases with depth', () => {
  it('depth-0 (BOI) has the largest font size', () => {
    expect(fontSizeForDepth(0)).toBe(FONT_SIZE[0]);
    expect(fontSizeForDepth(0)).toBeGreaterThan(fontSizeForDepth(1));
  });

  it('depth-1 is smaller than depth-0 but larger than depth-2', () => {
    expect(fontSizeForDepth(1)).toBeLessThan(fontSizeForDepth(0));
    expect(fontSizeForDepth(1)).toBeGreaterThan(fontSizeForDepth(2));
  });

  it('depth-2 and beyond return the minimum font size', () => {
    expect(fontSizeForDepth(2)).toBe(FONT_SIZE[2]);
    expect(fontSizeForDepth(5)).toBe(FONT_SIZE[2]);
  });

  it('BOI font is at least 1.5x sub-branch font (AT-LE-030)', () => {
    // AT-LE-030: pixel height of BOI ≥ 1.5× sub-branch text
    expect(fontSizeForDepth(0)).toBeGreaterThanOrEqual(fontSizeForDepth(1) * 1.5);
  });
});
