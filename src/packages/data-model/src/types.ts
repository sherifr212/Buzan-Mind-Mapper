// ─── Primitives ───────────────────────────────────────────────────────────────

export type UUID = string;
export type HexColor = string; // e.g. '#E53935'
export type ISO8601 = string;
export type SVGPath = string;

// ─── Enums ────────────────────────────────────────────────────────────────────

export type Orientation = 'LANDSCAPE';

export type ArrowDirectionality = 'UNI' | 'BIDIRECTIONAL' | 'MULTI';

export type NodeType = 'raster' | 'svg' | 'drawn' | 'text-image';

// ─── CodeSymbol ───────────────────────────────────────────────────────────────

export interface CodeSymbol {
  symbol: string; // tick, cross, circle, triangle, underline, or custom SVG
  color: HexColor;
}

// ─── ImageAsset ───────────────────────────────────────────────────────────────

export interface ImageAsset {
  id: UUID;
  type: NodeType;
  src: string; // DataURI or URL
  colors: HexColor[]; // min 3 for central image
  hasDimension: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

// ─── ImageNode (alias for clarity) ───────────────────────────────────────────

export type ImageNode = ImageAsset;

// ─── ArrowStyle ───────────────────────────────────────────────────────────────

export interface ArrowStyle {
  size: number;
  form: string; // e.g. 'solid', 'dashed', 'dotted'
  dimension: boolean;
}

// ─── Arrow ────────────────────────────────────────────────────────────────────

export interface Arrow {
  id: UUID;
  sourceNodeId: UUID;
  targetNodeId: UUID;
  directionality: ArrowDirectionality;
  arrowStyle: ArrowStyle;
  label: string | null;
  color: HexColor;
}

// ─── BranchNode ───────────────────────────────────────────────────────────────

export interface BranchNode {
  id: UUID;
  parentId: UUID | null; // null = BOI (Basic Ordering Idea — directly on Central Image)
  keyword: string; // exactly one word
  isUpperCase: boolean;
  color: HexColor; // inherited from BOI ancestor
  lineThickness: number;
  isCurved: boolean; // defaults to true
  length: number; // must equal rendered pixel width of keyword text
  angle: number; // radians
  depth: number; // 0 = BOI, max 14
  image: ImageAsset | null;
  hasBoundary: boolean;
  boundaryShape: SVGPath | null;
  numericalOrder: number | null;
  codes: CodeSymbol[];
  blankLine: boolean;
  linkedMapId: UUID | null;
}

// ─── ReviewSchedule ───────────────────────────────────────────────────────────

export interface ReviewSchedule {
  intervals: number[]; // durations in minutes from createdAt: [10, 1440, 10080, 43200, 129600, 259200]
  completed: boolean[];
  nextReviewAt: ISO8601;
}

// ─── BranchRef / MapRef ───────────────────────────────────────────────────────

export interface BranchRef {
  branchId: UUID;
  order: number;
}

export interface MapRef {
  mapId: UUID;
  branchId: UUID;
}

export interface Participant {
  id: UUID;
  color: HexColor;
  name: string;
}

// ─── MindMap ──────────────────────────────────────────────────────────────────

export interface MindMap {
  id: UUID;
  title: string;
  centralImage: ImageNode;
  bois: BranchNode[]; // top-level BOI branches (parentId = null)
  orientation: Orientation; // always LANDSCAPE
  canvasSize: { width: number; height: number };
  colorPalette: HexColor[]; // min 3 colours
  numericalOrder: BranchRef[];
  createdAt: ISO8601;
  updatedAt: ISO8601;
  reviewSchedule: ReviewSchedule | null;
  tags: string[];
  isGroupMap: boolean;
  linkedMaps: MapRef[];
  // Full branch tree (bois + all sub-branches flattened)
  branches: BranchNode[];
  // Arrows / associations
  arrows: Arrow[];
  // Participants (for group maps)
  participants: Participant[];
}
