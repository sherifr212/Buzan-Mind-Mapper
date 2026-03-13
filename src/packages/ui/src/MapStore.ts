import { create } from 'zustand';
import type { MindMap, BranchNode } from '@bmm/data-model';
import { EnforcementEngine } from '@bmm/enforcement';
import { checkKeywordSingleWord, checkOrientationIsLandscape } from '@bmm/enforcement';

// ─── MapStore ─────────────────────────────────────────────────────────────────
// Zustand store managing the active MindMap state for the editing UI.
// Supports unlimited undo/redo via a past/future snapshot stack.
// Sprint 7: EnforcementEngine wired as middleware — BLOCK/WARN on every mutation.

const genId = () => Math.random().toString(36).slice(2, 10);

const engine = new EnforcementEngine();

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

// ─── Enforcement UI State ─────────────────────────────────────────────────────

export interface BlockModalState {
  lawId: string;
  message: string;
  helpUrl?: string;
}

export interface WarnItem {
  id: string;
  lawId: string;
  message: string;
}

export interface ClarityModalState {
  branchId: string;
  pendingKeyword: string;
  words: string[];
}

export interface CoachItem {
  id: string;
  lawId: string;
  message: string;
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

  // ─── Enforcement UI state ──────────────────────────────────────────────────
  /** Active BLOCK modal. Null when no block is in effect. */
  blockModal: BlockModalState | null;
  /** Active WARN notifications (toast queue). */
  warnQueue: WarnItem[];
  /** Pending Clarity Modal (LE-060 multi-word keyword). */
  clarityModal: ClarityModalState | null;
  /** COACH tips queue (non-blocking, timed). */
  coachQueue: CoachItem[];

  // ─── Sequence & Cluster state ──────────────────────────────────────────────
  /** Whether Sequence Mode is active (numbered BOI badges). */
  sequenceMode: boolean;

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

  // ─── Enforcement actions ───────────────────────────────────────────────────
  dismissBlock: () => void;
  dismissWarn: (id: string) => void;
  dismissCoach: (id: string) => void;
  commitClarityKeep: () => void;
  commitClaritySplit: () => void;
  setOrientation: (orientation: string) => void;
  addCoachTip: (tip: Omit<CoachItem, 'id'>) => void;
  addTimedWarn: (warn: Omit<WarnItem, 'id'>) => void;
  populateBOIs: (keywords: string[]) => void;

  // ─── Sequence & Cluster actions ────────────────────────────────────────────
  toggleSequenceMode: () => void;
  assignNumericalOrder: (branchId: string, order: number) => void;
  markClusterComplete: (branchId: string) => void;
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

/** Run enforcement checks after a mutation and return any WARN items.
 *  LE-082 is excluded — it is timer-triggered in the canvas component. */
function collectWarns(map: MindMap): WarnItem[] {
  const results = engine.check(map, { type: 'CREATE_BRANCH' });
  return results
    .filter((r) => r.level === 'WARN' && r.lawId !== 'LE-082')
    .map((r) => ({ id: genId(), lawId: r.lawId, message: r.message }));
}

/** Check for LE-052: arrow coaching fires at 10+ branches with zero arrows. */
function collectArrowCoachTip(map: MindMap): CoachItem[] {
  if (map.branches.length >= 10 && map.arrows.length === 0) {
    return [
      {
        id: genId(),
        lawId: 'LE-052',
        message:
          'Buzan uses arrows to reveal hidden connections — they cross boundaries and link related ideas across your map.',
      },
    ];
  }
  return [];
}

export const useMapStore = create<MapStoreState>((set, get) => ({
  map: null,
  selectedBranchId: null,
  editingBranchId: null,
  nodePositions: {},
  past: [],
  future: [],
  blockModal: null,
  warnQueue: [],
  clarityModal: null,
  coachQueue: [],
  sequenceMode: false,

  loadMap: (map) =>
    set({
      map,
      selectedBranchId: null,
      editingBranchId: null,
      nodePositions: {},
      past: [],
      future: [],
      blockModal: null,
      warnQueue: [],
      clarityModal: null,
      coachQueue: [],
    }),

  selectBranch: (id) => set({ selectedBranchId: id }),

  setEditingBranch: (id) => set({ editingBranchId: id }),

  updateKeyword: (branchId, keyword) =>
    set((state) => {
      if (!state.map) return state;

      // LE-060: Multi-word keyword → show Clarity Modal, do NOT commit
      const clarityResults = checkKeywordSingleWord({ keyword });
      if (clarityResults.length > 0) {
        const words = keyword.trim().split(/\s+/);
        return {
          ...state,
          clarityModal: { branchId, pendingKeyword: keyword, words },
          editingBranchId: null,
        };
      }

      const hist = pushHistory(state);
      const newMap = {
        ...state.map,
        branches: state.map.branches.map((b) =>
          b.id === branchId ? { ...b, keyword, isUpperCase: b.depth === 0 } : b
        ),
      };
      return {
        ...hist,
        map: newMap,
      };
    }),

  addChildBranch: (parentId) =>
    set((state) => {
      if (!state.map) return state;

      // LE-001: BLOCK if no central image
      if (!state.map.centralImage) {
        return {
          ...state,
          blockModal: {
            lawId: 'LE-001',
            message: 'Every Mind Map begins with a Central Image',
            helpUrl: '#why-central-image',
          },
        };
      }

      const hist = pushHistory(state);
      const parent = state.map.branches.find((b) => b.id === parentId);
      const depth = parent ? parent.depth + 1 : 0;
      const boiCount = state.map.branches.filter((b) => b.parentId === null).length;
      // Inherit colour from BOI ancestor
      let color = parent?.color ?? state.map.colorPalette[0] ?? '#555555';
      if (parent?.parentId === null) color = parent.color; // already BOI colour
      const newBranch = makeBranch(parentId, depth, state.map.colorPalette, boiCount, { color });
      const newMap = {
        ...state.map,
        branches: [...state.map.branches, newBranch],
        updatedAt: new Date().toISOString(),
      };

      // Post-check: collect WARN and COACH results
      const warns = collectWarns(newMap);
      const coaches = collectArrowCoachTip(newMap);

      return {
        ...hist,
        map: newMap,
        selectedBranchId: newBranch.id,
        editingBranchId: newBranch.id,
        warnQueue: warns.length > 0 ? warns : state.warnQueue,
        coachQueue: coaches.length > 0 ? [...state.coachQueue, ...coaches] : state.coachQueue,
      };
    }),

  addSiblingBranch: (branchId) =>
    set((state) => {
      if (!state.map) return state;

      // LE-001: BLOCK if no central image
      if (!state.map.centralImage) {
        return {
          ...state,
          blockModal: {
            lawId: 'LE-001',
            message: 'Every Mind Map begins with a Central Image',
            helpUrl: '#why-central-image',
          },
        };
      }

      const hist = pushHistory(state);
      const branch = state.map.branches.find((b) => b.id === branchId);
      if (!branch) return state;
      const boiCount = state.map.branches.filter((b) => b.parentId === null).length;
      const color =
        branch.parentId === null
          ? state.map.colorPalette[boiCount % state.map.colorPalette.length] ?? '#555555'
          : branch.color;
      const newBranch = makeBranch(branch.parentId, branch.depth, state.map.colorPalette, boiCount, { color });
      const newMap = {
        ...state.map,
        branches: [...state.map.branches, newBranch],
        updatedAt: new Date().toISOString(),
      };

      // Post-check: collect WARN and COACH results
      const warns = collectWarns(newMap);
      const coaches = collectArrowCoachTip(newMap);

      return {
        ...hist,
        map: newMap,
        selectedBranchId: newBranch.id,
        editingBranchId: newBranch.id,
        warnQueue: warns.length > 0 ? warns : state.warnQueue,
        coachQueue: coaches.length > 0 ? [...state.coachQueue, ...coaches] : state.coachQueue,
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

      // LE-001: BLOCK if no central image
      if (!state.map.centralImage) {
        return {
          ...state,
          blockModal: {
            lawId: 'LE-001',
            message: 'Every Mind Map begins with a Central Image',
            helpUrl: '#why-central-image',
          },
        };
      }

      const hist = pushHistory(state);
      const parent = parentId ? state.map.branches.find((b) => b.id === parentId) : null;
      const depth = parent ? parent.depth + 1 : 0;
      const boiCount = state.map.branches.filter((b) => b.parentId === null).length;
      const color =
        parent?.color ?? state.map.colorPalette[boiCount % state.map.colorPalette.length] ?? '#555555';
      const blank = makeBranch(parentId, depth, state.map.colorPalette, boiCount, {
        color,
        keyword: '',
        blankLine: true,
      });
      const newMap = {
        ...state.map,
        branches: [...state.map.branches, blank],
        updatedAt: new Date().toISOString(),
      };
      // Post-check: collect WARN and COACH results
      const warns = collectWarns(newMap);
      const coaches = collectArrowCoachTip(newMap);
      return {
        ...hist,
        map: newMap,
        warnQueue: warns.length > 0 ? warns : state.warnQueue,
        coachQueue: coaches.length > 0 ? [...state.coachQueue, ...coaches] : state.coachQueue,
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

  // ─── Enforcement actions ─────────────────────────────────────────────────────

  dismissBlock: () => set({ blockModal: null }),

  dismissWarn: (id) =>
    set((state) => ({
      warnQueue: state.warnQueue.filter((w) => w.id !== id),
    })),

  dismissCoach: (id) =>
    set((state) => ({
      coachQueue: state.coachQueue.filter((c) => c.id !== id),
    })),

  addCoachTip: (tip) =>
    set((state) => ({
      coachQueue: [...state.coachQueue, { ...tip, id: genId() }],
    })),

  addTimedWarn: (warn) =>
    set((state) => ({
      warnQueue: [...state.warnQueue, { ...warn, id: genId() }],
    })),

  populateBOIs: (keywords) =>
    set((state) => {
      if (!state.map) return state;
      const hist = pushHistory(state);
      const filtered = keywords.map((k) => k.trim()).filter(Boolean);
      const newBranches = filtered.map((kw, i) =>
        makeBranch(null, 0, state.map!.colorPalette, i, {
          keyword: kw.toUpperCase(),
          isUpperCase: true,
          angle: (2 * Math.PI * i) / filtered.length,
        })
      );
      return {
        ...hist,
        map: {
          ...state.map,
          branches: [...state.map.branches, ...newBranches],
          updatedAt: new Date().toISOString(),
        },
      };
    }),

  commitClarityKeep: () =>
    set((state) => {
      if (!state.clarityModal || !state.map) return { ...state, clarityModal: null };
      const { branchId, pendingKeyword } = state.clarityModal;
      const hist = pushHistory(state);
      return {
        ...hist,
        map: {
          ...state.map,
          branches: state.map.branches.map((b) =>
            b.id === branchId ? { ...b, keyword: pendingKeyword, isUpperCase: b.depth === 0 } : b
          ),
        },
        clarityModal: null,
        editingBranchId: null,
      };
    }),

  commitClaritySplit: () =>
    set((state) => {
      if (!state.clarityModal || !state.map) return { ...state, clarityModal: null };
      const { branchId, words } = state.clarityModal;
      const branch = state.map.branches.find((b) => b.id === branchId);
      if (!branch) return { ...state, clarityModal: null };

      const hist = pushHistory(state);

      // Update original branch with first word
      const updatedBranches = state.map.branches.map((b) =>
        b.id === branchId ? { ...b, keyword: words[0], isUpperCase: b.depth === 0 } : b
      );

      // Add sibling branches for remaining words, same depth and parent
      const siblingBranches: BranchNode[] = words.slice(1).map((word) => ({
        ...branch,
        id: genId(),
        keyword: word,
        isUpperCase: branch.depth === 0,
      }));

      return {
        ...hist,
        map: {
          ...state.map,
          branches: [...updatedBranches, ...siblingBranches],
          updatedAt: new Date().toISOString(),
        },
        clarityModal: null,
        editingBranchId: null,
      };
    }),

  setOrientation: (orientation) => {
    const results = checkOrientationIsLandscape(orientation);
    if (results.length > 0) {
      set({
        blockModal: {
          lawId: 'LE-062',
          message: results[0].message,
        },
      });
      return;
    }
    // Valid orientation — update the map
    set((state) => {
      if (!state.map) return state;
      return {
        map: { ...state.map, orientation: orientation as MindMap['orientation'] },
      };
    });
    // setOrientation doesn't use get() internally — call through the store
    void get;
  },

  // ─── Sequence & Cluster actions ───────────────────────────────────────────

  toggleSequenceMode: () =>
    set((state) => ({ sequenceMode: !state.sequenceMode })),

  assignNumericalOrder: (branchId, order) =>
    set((state) => {
      if (!state.map) return state;
      return {
        map: {
          ...state.map,
          branches: state.map.branches.map((b) =>
            b.id === branchId ? { ...b, numericalOrder: order } : b
          ),
          updatedAt: new Date().toISOString(),
        },
      };
    }),

  markClusterComplete: (branchId) =>
    set((state) => {
      if (!state.map) return state;
      const hist = pushHistory(state);
      return {
        ...hist,
        map: {
          ...state.map,
          branches: state.map.branches.map((b) =>
            b.id === branchId
              ? { ...b, hasBoundary: true, boundaryShape: 'M 0 0 ellipse' }
              : b
          ),
          updatedAt: new Date().toISOString(),
        },
      };
    }),
}));
