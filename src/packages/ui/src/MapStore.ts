import { create } from 'zustand';
import type { MindMap, BranchNode } from '@bmm/data-model';

// ─── MapStore ─────────────────────────────────────────────────────────────────
// Zustand store managing the active MindMap state for the editing UI.
// Supports unlimited undo/redo via a past/future snapshot stack.

const genId = () => Math.random().toString(36).slice(2, 10);

function collectSubtreeIds(branches: BranchNode[], rootId: string): Set<string> {
  const ids = new Set<string>([rootId]);
  const queue = [rootId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const b of branches) {
      if (b.parentId === current) {
        ids.add(b.id);
        queue.push(b.id);
      }
    }
  }
  return ids;
}

export interface MapStoreState {
  map: MindMap | null;
  selectedBranchId: string | null;
  editingBranchId: string | null;
  /** Custom node positions set by drag (branchId → {x,y}). */
  nodePositions: Record<string, { x: number; y: number }>;
  /** Undo history: past map snapshots. */
  past: MindMap[];
  /** Redo history: future map snapshots. */
  future: MindMap[];

  loadMap: (map: MindMap) => void;
  selectBranch: (id: string | null) => void;
  setEditingBranch: (id: string | null) => void;
  updateKeyword: (branchId: string, keyword: string) => void;
  addChildBranch: (parentId: string) => void;
  addSiblingBranch: (branchId: string) => void;
  deleteBranch: (branchId: string) => void;
  addBlankLine: (parentId: string | null) => void;
  updateNodePosition: (branchId: string, x: number, y: number) => void;
  undo: () => void;
  redo: () => void;
}

/** Push current map onto past stack before a mutation. */
function pushHistory(state: MapStoreState): { past: MindMap[]; future: MindMap[] } {
  if (!state.map) return { past: state.past, future: state.future };
  return {
    past: [...state.past, state.map],
    future: [], // clear redo stack on new action
  };
}

/** Create a new BOI (depth-0) branch attached to the central image. */
function makeBranch(
  parentId: string | null,
  depth: number,
  colorPalette: string[],
  boiCount: number,
  overrides: Partial<BranchNode> = {}
): BranchNode {
  const color = colorPalette[boiCount % colorPalette.length] ?? '#555555';
  return {
    id: genId(),
    parentId,
    keyword: 'New',
    isUpperCase: depth === 0,
    color: depth === 0 ? color : '#555555',
    lineThickness: depth === 0 ? 5 : depth === 1 ? 2.5 : 1,
    isCurved: true,
    length: 60,
    angle: 0,
    depth,
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

export const useMapStore = create<MapStoreState>((set) => ({
  map: null,
  selectedBranchId: null,
  editingBranchId: null,
  nodePositions: {},
  past: [],
  future: [],

  loadMap: (map) =>
    set({ map, selectedBranchId: null, editingBranchId: null, nodePositions: {}, past: [], future: [] }),

  selectBranch: (id) => set({ selectedBranchId: id }),

  setEditingBranch: (id) => set({ editingBranchId: id }),

  updateKeyword: (branchId, keyword) =>
    set((state) => {
      if (!state.map) return state;
      const hist = pushHistory(state);
      return {
        ...hist,
        map: {
          ...state.map,
          branches: state.map.branches.map((b) =>
            b.id === branchId ? { ...b, keyword, isUpperCase: b.depth === 0 } : b
          ),
        },
      };
    }),

  addChildBranch: (parentId) =>
    set((state) => {
      if (!state.map) return state;
      const hist = pushHistory(state);
      const parent = state.map.branches.find((b) => b.id === parentId);
      const depth = parent ? parent.depth + 1 : 0;
      const boiCount = state.map.branches.filter((b) => b.parentId === null).length;
      // Inherit colour from BOI ancestor
      let color = parent?.color ?? state.map.colorPalette[0] ?? '#555555';
      if (parent?.parentId === null) color = parent.color; // already BOI colour
      const newBranch = makeBranch(parentId, depth, state.map.colorPalette, boiCount, { color });
      return {
        ...hist,
        map: {
          ...state.map,
          branches: [...state.map.branches, newBranch],
          updatedAt: new Date().toISOString(),
        },
        selectedBranchId: newBranch.id,
        editingBranchId: newBranch.id,
      };
    }),

  addSiblingBranch: (branchId) =>
    set((state) => {
      if (!state.map) return state;
      const hist = pushHistory(state);
      const branch = state.map.branches.find((b) => b.id === branchId);
      if (!branch) return state;
      const boiCount = state.map.branches.filter((b) => b.parentId === null).length;
      const color = branch.parentId === null
        ? state.map.colorPalette[boiCount % state.map.colorPalette.length] ?? '#555555'
        : branch.color;
      const newBranch = makeBranch(branch.parentId, branch.depth, state.map.colorPalette, boiCount, { color });
      return {
        ...hist,
        map: {
          ...state.map,
          branches: [...state.map.branches, newBranch],
          updatedAt: new Date().toISOString(),
        },
        selectedBranchId: newBranch.id,
        editingBranchId: newBranch.id,
      };
    }),

  deleteBranch: (branchId) =>
    set((state) => {
      if (!state.map) return state;
      const subtree = collectSubtreeIds(state.map.branches, branchId);
      const hist = pushHistory(state);
      return {
        ...hist,
        map: {
          ...state.map,
          branches: state.map.branches.filter((b) => !subtree.has(b.id)),
          updatedAt: new Date().toISOString(),
        },
        selectedBranchId: null,
        editingBranchId: null,
      };
    }),

  addBlankLine: (parentId) =>
    set((state) => {
      if (!state.map) return state;
      const hist = pushHistory(state);
      const parent = parentId ? state.map.branches.find((b) => b.id === parentId) : null;
      const depth = parent ? parent.depth + 1 : 0;
      const boiCount = state.map.branches.filter((b) => b.parentId === null).length;
      const color = parent?.color ?? state.map.colorPalette[boiCount % state.map.colorPalette.length] ?? '#555555';
      const blank = makeBranch(parentId, depth, state.map.colorPalette, boiCount, {
        color,
        keyword: '',
        blankLine: true,
      });
      return {
        ...hist,
        map: {
          ...state.map,
          branches: [...state.map.branches, blank],
          updatedAt: new Date().toISOString(),
        },
      };
    }),

  updateNodePosition: (branchId, x, y) =>
    set((state) => ({
      nodePositions: { ...state.nodePositions, [branchId]: { x, y } },
    })),

  undo: () =>
    set((state) => {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        future: state.map ? [state.map, ...state.future] : state.future,
        map: previous,
        selectedBranchId: null,
        editingBranchId: null,
      };
    }),

  redo: () =>
    set((state) => {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        past: state.map ? [...state.past, state.map] : state.past,
        future: state.future.slice(1),
        map: next,
        selectedBranchId: null,
        editingBranchId: null,
      };
    }),
}));
