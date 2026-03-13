import type { MindMap } from '@bmm/data-model';

// ─── C1+ Delta ────────────────────────────────────────────────────────────────

export interface C1Delta {
  deltaColours: number;
  deltaImages: number;
  deltaArrows: number;
  deltaBoundaries: number;
  improvements: string[];
  regressions: string[];
}

export interface MapMetrics {
  colourCount: number;
  imageCount: number;
  arrowCount: number;
  boundaryCount: number;
}

function computeMetrics(map: MindMap): MapMetrics {
  const allColors = new Set<string>();
  if (map.centralImage) {
    for (const c of map.centralImage.colors) allColors.add(c);
  }
  for (const b of map.branches) allColors.add(b.color);

  return {
    colourCount: allColors.size,
    imageCount: map.branches.filter((b) => b.image !== null).length,
    arrowCount: map.arrows.length,
    boundaryCount: map.branches.filter((b) => b.hasBoundary).length,
  };
}

/**
 * Computes the C1+ delta between two consecutive maps.
 * LE-071: After each saved map, compare with the previous map.
 *
 * @param mapA - the previous map (baseline)
 * @param mapB - the new map (current)
 */
export function computeC1Delta(mapA: MindMap, mapB: MindMap): C1Delta {
  const metricsA = computeMetrics(mapA);
  const metricsB = computeMetrics(mapB);

  const deltaColours = metricsB.colourCount - metricsA.colourCount;
  const deltaImages = metricsB.imageCount - metricsA.imageCount;
  const deltaArrows = metricsB.arrowCount - metricsA.arrowCount;
  const deltaBoundaries = metricsB.boundaryCount - metricsA.boundaryCount;

  const improvements: string[] = [];
  const regressions: string[] = [];

  if (deltaColours > 0) improvements.push(`+${deltaColours} colour(s) — great variety!`);
  if (deltaColours < 0) regressions.push(`Your previous map had more colours — try adding some to this one!`);

  if (deltaImages > 0) improvements.push(`+${deltaImages} image(s) — visual power!`);
  if (deltaImages < 0) regressions.push(`Your previous map had more images — try adding some to this one!`);

  if (deltaArrows > 0) improvements.push(`+${deltaArrows} arrow(s) — excellent associations!`);
  if (deltaArrows < 0) regressions.push(`Your previous map had more arrows — try making connections!`);

  if (deltaBoundaries > 0) improvements.push(`+${deltaBoundaries} boundar(y/ies) — great visual chunking!`);
  if (deltaBoundaries < 0) regressions.push(`Your previous map had more boundaries — try grouping your branches!`);

  return {
    deltaColours,
    deltaImages,
    deltaArrows,
    deltaBoundaries,
    improvements,
    regressions,
  };
}
