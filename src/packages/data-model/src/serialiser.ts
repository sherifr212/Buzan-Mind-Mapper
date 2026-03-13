import type { MindMap } from './types.js';
import { BMMValidationError } from './errors.js';
import { validateMindMap } from './validation.js';

// ─── .bmm Format ─────────────────────────────────────────────────────────────

interface BmmDocument {
  format: 'bmm';
  version: '1.0';
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  canvas: {
    width: number;
    height: number;
    orientation: 'LANDSCAPE';
  };
  colorPalette: string[];
  centralImage: MindMap['centralImage'];
  branches: MindMap['branches'];
  arrows: MindMap['arrows'];
  reviewSchedule: MindMap['reviewSchedule'];
  isGroupMap: boolean;
  participants: MindMap['participants'];
  linkedMaps: MindMap['linkedMaps'];
  numericalOrder: MindMap['numericalOrder'];
  tags: string[];
}

// ─── Serialise ────────────────────────────────────────────────────────────────

/**
 * Serialises a MindMap to .bmm JSON string.
 * AT-DM-030: round-trip preserves all fields.
 */
export function serialise(map: MindMap): string {
  const doc: BmmDocument = {
    format: 'bmm',
    version: '1.0',
    id: map.id,
    title: map.title,
    createdAt: map.createdAt,
    updatedAt: map.updatedAt,
    canvas: {
      width: map.canvasSize.width,
      height: map.canvasSize.height,
      orientation: 'LANDSCAPE',
    },
    colorPalette: map.colorPalette,
    centralImage: map.centralImage,
    branches: map.branches,
    arrows: map.arrows,
    reviewSchedule: map.reviewSchedule,
    isGroupMap: map.isGroupMap,
    participants: map.participants,
    linkedMaps: map.linkedMaps,
    numericalOrder: map.numericalOrder,
    tags: map.tags,
  };

  return JSON.stringify(doc, null, 2);
}

// ─── Deserialise ──────────────────────────────────────────────────────────────

/**
 * Deserialises a .bmm JSON string to a MindMap.
 * AT-DM-030: round-trip preserves all fields.
 * AT-DM-031: throws BMMValidationError if required fields are missing.
 */
export function deserialise(json: string): MindMap {
  let doc: Partial<BmmDocument>;

  try {
    doc = JSON.parse(json) as Partial<BmmDocument>;
  } catch {
    throw new BMMValidationError('Invalid .bmm file: JSON parse error', [
      { code: 'JSON_PARSE_ERROR', message: 'Failed to parse .bmm JSON' },
    ]);
  }

  // Validate required fields
  const validationResult = validateMindMap({
    centralImage: doc.centralImage,
    colorPalette: doc.colorPalette,
    orientation: doc.canvas?.orientation,
  });

  if (!validationResult.valid) {
    throw new BMMValidationError('Invalid .bmm file: validation failed', validationResult.errors);
  }

  // Map back to MindMap shape
  const map: MindMap = {
    id: doc.id ?? '',
    title: doc.title ?? '',
    centralImage: doc.centralImage!,
    bois: (doc.branches ?? []).filter((b) => b.parentId === null),
    branches: doc.branches ?? [],
    orientation: 'LANDSCAPE',
    canvasSize: {
      width: doc.canvas?.width ?? 0,
      height: doc.canvas?.height ?? 0,
    },
    colorPalette: doc.colorPalette ?? [],
    numericalOrder: doc.numericalOrder ?? [],
    createdAt: doc.createdAt ?? new Date().toISOString(),
    updatedAt: doc.updatedAt ?? new Date().toISOString(),
    reviewSchedule: doc.reviewSchedule ?? null,
    tags: doc.tags ?? [],
    isGroupMap: doc.isGroupMap ?? false,
    linkedMaps: doc.linkedMaps ?? [],
    arrows: doc.arrows ?? [],
    participants: doc.participants ?? [],
  };

  return map;
}
