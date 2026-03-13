import type { MindMap } from '@bmm/data-model';

// ─── Radiant Score ────────────────────────────────────────────────────────────
// HP-003: A 0–100 metric that reflects compliance with Buzan's laws.
// Higher = more compliant with Buzan's methodology.
//
// Scoring components (weighted):
// 1. Central Image present (20 pts)
// 2. Colour diversity (≥3 colours → 15pts, ≥5 → 5 bonus)
// 3. Image density (≥1 branch image → 15pts, ≥30% density → 5 bonus)
// 4. Arrows present (≥1 → 10pts)
// 5. Keyword compliance (single-word keywords ratio × 15pts)
// 6. Hierarchy (sub-branches present → 10pts)
// 7. BOI colour uniqueness (all unique → 10pts)

export function computeRadiantScore(map: MindMap): number {
  let score = 0;

  // 1. Central Image (20pts)
  if (map.centralImage) score += 20;

  // 2. Colour diversity
  const allColors = new Set<string>();
  if (map.centralImage) {
    for (const c of map.centralImage.colors) allColors.add(c);
  }
  for (const b of map.branches) allColors.add(b.color);
  if (allColors.size >= 3) score += 15;
  if (allColors.size >= 5) score += 5;

  // 3. Image density
  const imageCount = map.branches.filter((b) => b.image !== null).length;
  if (imageCount >= 1) score += 15;
  if (map.branches.length > 0 && imageCount / map.branches.length >= 0.3) score += 5;

  // 4. Arrows
  if (map.arrows.length >= 1) score += 10;

  // 5. Keyword compliance (single-word)
  if (map.branches.length > 0) {
    const singleWordCount = map.branches.filter(
      (b) => !b.keyword.trim().includes(' ')
    ).length;
    score += Math.round((singleWordCount / map.branches.length) * 15);
  } else {
    score += 15; // no branches = no violations
  }

  // 6. Hierarchy (sub-branches present)
  const hasSubBranches = map.branches.some((b) => b.parentId !== null);
  if (hasSubBranches) score += 10;

  // 7. BOI colour uniqueness
  const bois = map.branches.filter((b) => b.parentId === null);
  const boiColors = new Set(bois.map((b) => b.color));
  if (bois.length === 0 || boiColors.size === bois.length) score += 5;

  return Math.min(100, score);
}
