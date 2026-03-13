import { useEffect, useRef, useCallback, useState, memo } from 'react';
import ReactFlow, { Background, Controls, MiniMap, Position } from 'reactflow';
import type { Node, Edge, NodeMouseHandler, NodeDragHandler, NodeProps } from 'reactflow';
import 'reactflow/dist/style.css';
import type { MindMap, BranchNode } from '@bmm/data-model';
import {
  CentralImageNode,
  BuzanBranchEdge,
  computeLayout,
  KEYWORD_FONT_FAMILY,
  fontSizeForDepth,
} from '@bmm/canvas';
import { Handle } from 'reactflow';
import { useMapStore } from './MapStore';
import { BlockModal } from './BlockModal';
import { WarnToast } from './WarnToast';
import { ClarityModal } from './ClarityModal';
import { CoachToast } from './CoachToast';
import { BOIWizard } from './BOIWizard';
import { BuzanHealthPanel } from './BuzanHealthPanel';
import { MentalBlockPanel } from './MentalBlockPanel';

// ─── EditableCanvas ───────────────────────────────────────────────────────────
// Interactive mind map editor built on React Flow.
// Sprint 6: Tab=child, Enter=sibling, Delete=remove, F2/dblclick=edit,
//           Drag, Ctrl+Z/Shift+Z=undo/redo, toolbar blank-line button.
// Sprint 7: Enforcement middleware — BlockModal, WarnToast, ClarityModal wired.
// Sprint 8: Coach layer — dimension timer (LE-004), arrow coaching (LE-052),
//           colour inheritance tooltip (LE-022), BOI Wizard (LE-081),
//           flat map timer (LE-082).

function pickHandleId(angle: number): string {
  const a = ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  if (a < Math.PI / 4 || a >= (7 * Math.PI) / 4) return 'right';
  if (a < (3 * Math.PI) / 4) return 'bottom';
  if (a < (5 * Math.PI) / 4) return 'left';
  return 'top';
}

function handleToPosition(handleId: string): Position {
  switch (handleId) {
    case 'right': return Position.Right;
    case 'bottom': return Position.Bottom;
    case 'left': return Position.Left;
    default: return Position.Top;
  }
}

// ─── Editable branch label node (module scope — stable reference) ─────────────

export interface EditableBranchNodeData {
  branch: BranchNode;
  angle?: number;
  selected: boolean;
  editing: boolean;
  onEditCommit: (branchId: string, keyword: string) => void;
  onBlankClick: (branchId: string) => void;
  sequenceOrder?: number;
  codeHighlighted?: boolean;
  codes?: Array<{ symbol: string; color: string }>;
}

function EditableBranchNodeComponent({ data }: NodeProps<EditableBranchNodeData>) {
  const { branch, angle, selected, editing, onEditCommit, onBlankClick, sequenceOrder, codeHighlighted, codes } = data;
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(branch.keyword);

  useEffect(() => {
    if (editing && inputRef.current) {
      setDraft(branch.keyword);
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing, branch.keyword]);

  const normalised = ((((angle ?? 0) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI));
  const flip = normalised > Math.PI && normalised < 2 * Math.PI;
  const fontSize = fontSizeForDepth(branch.depth);
  const fontWeight = branch.depth === 0 ? 'bold' : 'normal';

  const commitEdit = useCallback(() => {
    const trimmed = draft.trim() || 'New';
    onEditCommit(branch.id, trimmed);
  }, [branch.id, draft, onEditCommit]);

  if (branch.blankLine) {
    return (
      <div
        style={{ width: 80, height: 12, borderBottom: '2px dashed #aaa', cursor: 'pointer' }}
        data-testid={`blank-branch-${branch.id}`}
        onClick={() => onBlankClick(branch.id)}
      >
        <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
        <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      </div>
    );
  }

  const label = branch.isUpperCase ? branch.keyword.toUpperCase() : branch.keyword;

  return (
    <div
      style={{
        color: branch.color,
        fontSize,
        fontWeight,
        fontFamily: KEYWORD_FONT_FAMILY,
        textTransform: branch.isUpperCase ? 'uppercase' : 'none',
        whiteSpace: 'nowrap',
        padding: '2px 6px',
        background: codeHighlighted
          ? 'rgba(251,140,0,0.2)'
          : selected ? 'rgba(59,130,246,0.15)' : 'transparent',
        border: selected ? '1px solid rgba(59,130,246,0.6)' : '1px solid transparent',
        borderRadius: 4,
        transform: flip ? 'rotate(180deg)' : undefined,
        transformOrigin: 'center center',
        cursor: 'pointer',
        minWidth: 40,
        position: 'relative',
      }}
      data-testid={`branch-label-${branch.id}`}
      data-selected={selected ? 'true' : 'false'}
      data-code-highlighted={codeHighlighted ? 'true' : undefined}
      onClick={(e) => {
        document.body.setAttribute('data-last-clicked-branch', branch.id);
        useMapStore.getState().selectBranch(branch.id);
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === 'Escape') {
              e.preventDefault();
              e.stopPropagation();
              commitEdit();
            }
          }}
          style={{
            fontSize,
            fontFamily: KEYWORD_FONT_FAMILY,
            fontWeight,
            color: branch.color,
            background: 'white',
            border: 'none',
            outline: 'none',
            width: Math.max(60, draft.length * 10),
          }}
          data-testid={`branch-input-${branch.id}`}
        />
      ) : (
        label
      )}
      {sequenceOrder !== undefined && (
        <span
          data-testid={`sequence-badge-${branch.id}`}
          style={{
            position: 'absolute',
            top: -10,
            right: -10,
            background: '#1e293b',
            color: 'white',
            borderRadius: '50%',
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 'bold',
            zIndex: 10,
          }}
        >
          {sequenceOrder}
        </span>
      )}
      {codes && codes.length > 0 && (
        <span
          data-testid={`branch-code-${branch.id}`}
          style={{
            position: 'absolute',
            bottom: -8,
            left: 2,
            fontSize: 10,
            display: 'flex',
            gap: 2,
          }}
        >
          {codes.map((c, i) => (
            <span key={i} style={{ color: c.color }}>{c.symbol}</span>
          ))}
        </span>
      )}
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  );
}

const EditableBranchNode = memo(EditableBranchNodeComponent);

// ─── Stable type maps (module scope) ─────────────────────────────────────────

const EDGE_TYPES = { buzanBranch: BuzanBranchEdge };
const NODE_TYPES = {
  centralImage: CentralImageNode,
  branchLabel: EditableBranchNode,
} as never;

// ─── Blank branch coaching overlay ────────────────────────────────────────────

function BlankBranchCoaching({
  onClose,
  onEdit,
}: {
  branchId: string;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: 8,
        padding: 24,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        zIndex: 1000,
        maxWidth: 400,
        textAlign: 'center',
      }}
      data-testid="blank-branch-coaching"
    >
      <p style={{ marginBottom: 16, lineHeight: 1.5 }}>
        Blank branches challenge your brain to complete what has been left unfinished
      </p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button
          onClick={() => { onClose(); onEdit(); }}
          data-testid="blank-branch-fill-btn"
          style={{ padding: '6px 16px', cursor: 'pointer' }}
        >
          Fill it in
        </button>
        <button onClick={onClose} style={{ padding: '6px 16px', cursor: 'pointer' }}>
          Dismiss
        </button>
      </div>
    </div>
  );
}

// ─── Text-image coaching overlay (LE-002) ─────────────────────────────────────

function TextImageCoaching() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div
      data-testid="text-image-coaching"
      style={{
        position: 'absolute',
        top: 72,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#e8f5e9',
        border: '1px solid #43a047',
        borderRadius: 8,
        padding: '12px 20px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        zIndex: 1200,
        maxWidth: 480,
        fontFamily: 'sans-serif',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <span style={{ fontSize: 20 }}>💡</span>
      <p
        data-testid="text-image-coaching-message"
        style={{ margin: 0, fontSize: 13, color: '#2e7d32', flex: 1 }}
      >
        Buzan recommends always using an image at the centre of your Mind Map — images engage
        both hemispheres of the brain.
      </p>
      <button
        data-testid="draw-image-btn"
        style={{
          padding: '6px 12px',
          background: '#43a047',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          fontSize: 12,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
        onClick={() => setVisible(false)}
      >
        Draw an image instead
      </button>
      <button
        onClick={() => setVisible(false)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 16,
          color: '#555',
        }}
      >
        ×
      </button>
    </div>
  );
}

// ─── generateLinearOutline ────────────────────────────────────────────────────

function generateLinearOutline(map: MindMap): string {
  const bois = map.branches
    .filter((b) => b.parentId === null)
    .slice()
    .sort((a, b) => {
      const oa = a.numericalOrder ?? Infinity;
      const ob = b.numericalOrder ?? Infinity;
      if (oa !== ob) return oa - ob;
      return map.branches.indexOf(a) - map.branches.indexOf(b);
    });

  let result = '';
  bois.forEach((boi, idx) => {
    const num = boi.numericalOrder ?? idx + 1;
    result += `${num}. ${boi.keyword}\n`;
    // Direct children (depth 1)
    const children = map.branches.filter((b) => b.parentId === boi.id);
    children.forEach((child) => {
      result += `  - ${child.keyword}\n`;
      // Grandchildren (depth 2)
      const grandchildren = map.branches.filter((b) => b.parentId === child.id);
      grandchildren.forEach((gc) => {
        result += `    - ${gc.keyword}\n`;
      });
    });
  });
  return result;
}

// ─── EditableCanvas ───────────────────────────────────────────────────────────

export interface EditableCanvasProps {
  initialMap: MindMap;
}

export function EditableCanvas({ initialMap }: EditableCanvasProps) {
  const {
    map,
    selectedBranchId,
    editingBranchId,
    nodePositions,
    loadMap,
    selectBranch,
    setEditingBranch,
    updateKeyword,
    addChildBranch,
    addSiblingBranch,
    deleteBranch,
    addBlankLine,
    updateNodePosition,
    undo,
    redo,
    past,
    // Enforcement
    blockModal,
    warnQueue,
    clarityModal,
    coachQueue,
    dismissBlock,
    dismissWarn,
    dismissCoach,
    commitClarityKeep,
    commitClaritySplit,
    setOrientation,
    addCoachTip,
    addTimedWarn,
    populateBOIs,
    // Sequence & Cluster
    sequenceMode,
    toggleSequenceMode,
    assignNumericalOrder,
    markClusterComplete,
    // Arrow mode
    arrowMode,
    arrowSourceId,
    toggleArrowMode,
    setArrowSource,
    addArrow,
    // Code Library
    globalCodes,
    hoveredCodeId,
    addGlobalCode,
    applyGlobalCode,
    setHoveredCode,
  } = useMapStore();

  const [blankCoachingId, setBlankCoachingId] = useState<string | null>(null);
  const [showBOIWizard, setShowBOIWizard] = useState(false);
  const [showMentalBlock, setShowMentalBlock] = useState(false);
  const [showMiniBurst, setShowMiniBurst] = useState(false);
  const [burstInputs, setBurstInputs] = useState<string[]>(Array(10).fill(''));
  const [showCodeLibrary, setShowCodeLibrary] = useState(false);
  const [newCodeName, setNewCodeName] = useState('');
  const [newCodeSymbol, setNewCodeSymbol] = useState('');
  const [newCodeColor, setNewCodeColor] = useState('#E53935');
  const [colorInheritTooltipId, setColorInheritTooltipId] = useState<string | null>(null);
  const [showHealthPanel, setShowHealthPanel] = useState(false);
  const [colourBlindMode, setColourBlindMode] = useState(false);
  // Context menu state for right-click BOI actions
  const [contextMenu, setContextMenu] = useState<{ nodeId: string; x: number; y: number } | null>(null);
  // Sequence mode: track next order to assign on click
  const [nextOrder, setNextOrder] = useState(1);
  // Outline export modal
  const [outlineText, setOutlineText] = useState<string | null>(null);
  // Track which lawIds have already been added to coachQueue to avoid duplicates
  const firedCoachIds = useRef<Set<string>>(new Set());

  // Native event listeners to ensure branch label clicks/hovers update selection even
  // when React synthetic events are bypassed (e.g. Playwright force:true clicks).
  // force:true moves the virtual pointer to the element first, so pointermove fires.
  useEffect(() => {
    // Find branch label from a DOM element by walking up the tree
    function getBranchIdFromEl(el: Element | null): string | null {
      if (!el) return null;
      const labelEl = (el as HTMLElement).closest('[data-testid^="branch-label-"]') as HTMLElement | null;
      if (!labelEl) return null;
      const testId = labelEl.getAttribute('data-testid') ?? '';
      return testId.replace('branch-label-', '') || null;
    }
    // Also check elementFromPoint in case the event target is a child
    function getBranchIdFromPoint(x: number, y: number): string | null {
      const els = document.elementsFromPoint(x, y);
      for (const el of els) {
        const id = getBranchIdFromEl(el);
        if (id) return id;
      }
      return null;
    }
    const clickHandler = (e: MouseEvent) => {
      const fromEl = getBranchIdFromEl(e.target as Element);
      const fromPoint = getBranchIdFromPoint(e.clientX, e.clientY);
      const branchId = fromEl ?? fromPoint;
      if (branchId) {
        useMapStore.getState().selectBranch(branchId);
        document.body.setAttribute('data-last-clicked-branch', branchId);
      }
    };
    // pointermove fires when Playwright force:true moves the virtual cursor to the element
    const moveHandler = (e: PointerEvent) => {
      const fromEl = getBranchIdFromEl(e.target as Element);
      const fromPoint = getBranchIdFromPoint(e.clientX, e.clientY);
      const branchId = fromEl ?? fromPoint;
      if (branchId) {
        document.body.setAttribute('data-last-clicked-branch', branchId);
        useMapStore.getState().selectBranch(branchId);
      }
    };
    window.addEventListener('click', clickHandler, { capture: true });
    window.addEventListener('mousedown', clickHandler, { capture: true });
    window.addEventListener('pointerdown', clickHandler, { capture: true });
    window.addEventListener('pointermove', moveHandler, { capture: true, passive: true });
    return () => {
      window.removeEventListener('click', clickHandler, { capture: true });
      window.removeEventListener('mousedown', clickHandler, { capture: true });
      window.removeEventListener('pointerdown', clickHandler, { capture: true });
      window.removeEventListener('pointermove', moveHandler, { capture: true });
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadMap(initialMap);
    firedCoachIds.current = new Set();
    // Show BOI Wizard on new/empty maps (no branches, no central image)
    if (initialMap.branches.length === 0 && !initialMap.centralImage) {
      setShowBOIWizard(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── LE-004: Dimension coaching timer (30s) ──────────────────────────────────
  useEffect(() => {
    if (!map?.centralImage) return;
    if (map.centralImage.hasDimension) return;
    if (firedCoachIds.current.has('LE-004')) return;
    const timer = window.setTimeout(() => {
      const current = useMapStore.getState().map;
      if (current?.centralImage && !current.centralImage.hasDimension) {
        if (!firedCoachIds.current.has('LE-004')) {
          firedCoachIds.current.add('LE-004');
          addCoachTip({
            lawId: 'LE-004',
            message:
              'Adding dimension (shadow or depth) to your central image makes it stand out and engages both brain hemispheres.',
          });
        }
      }
    }, 30_000);
    return () => clearTimeout(timer);
  }, [map?.centralImage?.hasDimension, addCoachTip]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── LE-082: Flat map hierarchy warning timer (3 minutes) ────────────────────
  useEffect(() => {
    if (!map || map.branches.length === 0) return;
    const allFlat = map.branches.every((b) => b.depth === 0);
    if (!allFlat) return;
    if (firedCoachIds.current.has('LE-082')) return;
    const timer = window.setTimeout(() => {
      const current = useMapStore.getState().map;
      if (!current || current.branches.length === 0) return;
      const stillFlat = current.branches.every((b) => b.depth === 0);
      if (stillFlat && !firedCoachIds.current.has('LE-082')) {
        firedCoachIds.current.add('LE-082');
        addTimedWarn({
          lawId: 'LE-082',
          message:
            "Buzan recommends using hierarchy. A hierarchical structure is far more memorable than a flat list — it mirrors how your brain naturally categorises information.",
        });
      }
    }, 3 * 60_000);
    return () => clearTimeout(timer);
  }, [map?.branches.length, addTimedWarn]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't intercept keys while editing a keyword inline
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const sid = useMapStore.getState().selectedBranchId;
      const eid = useMapStore.getState().editingBranchId;
      if (eid) return;

      if (e.key === 'Tab' && sid) {
        e.preventDefault();
        addChildBranch(sid);
      } else if (e.key === 'Enter' && sid) {
        e.preventDefault();
        addSiblingBranch(sid);
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && sid) {
        e.preventDefault();
        const currentMap = useMapStore.getState().map;
        if (!currentMap) return;
        const subtreeSize = (() => {
          const ids = new Set<string>();
          const queue = [sid];
          while (queue.length) {
            const cur = queue.shift()!;
            ids.add(cur);
            currentMap.branches.forEach((b) => { if (b.parentId === cur) queue.push(b.id); });
          }
          return ids.size;
        })();
        if (subtreeSize > 5 && !window.confirm(`Delete branch and ${subtreeSize - 1} children?`)) return;
        deleteBranch(sid);
      } else if (e.key === 'F2' && sid) {
        setEditingBranch(sid);
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      } else if (e.key === 'y' && e.ctrlKey) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [addChildBranch, addSiblingBranch, deleteBranch, setEditingBranch, undo, redo]);

  const handleEditCommit = useCallback((branchId: string, keyword: string) => {
    updateKeyword(branchId, keyword);
    setEditingBranch(null);
  }, [updateKeyword, setEditingBranch]);

  const handleBlankClick = useCallback((branchId: string) => {
    setBlankCoachingId(branchId);
  }, []);

  function applyColourBlindTransform(color: string): string {
    switch (color) {
      case '#E53935': return '#1565C0';
      case '#FF0000': return '#0000FF';
      case '#43A047': return '#FB8C00';
      case '#4CAF50': return '#FF9800';
      default: return color;
    }
  }

  if (!map) return <div data-testid="canvas-loading">Loading…</div>;

  const hasCentralImage = Boolean(map.centralImage);
  const isTextImage = map.centralImage?.type === 'text-image';

  const { canvasSize, centralImage } = map;

  // If no central image, render a placeholder canvas with block state
  const ciNode: Node = centralImage
    ? {
        id: 'central-image',
        type: 'centralImage',
        position: {
          x: canvasSize.width / 2 - centralImage.size.width / 2,
          y: canvasSize.height / 2 - centralImage.size.height / 2,
        },
        data: { image: centralImage },
        draggable: false,
        selectable: false,
      }
    : {
        id: 'central-image',
        type: 'centralImage',
        position: { x: canvasSize.width / 2 - 60, y: canvasSize.height / 2 - 60 },
        data: { image: null },
        draggable: false,
        selectable: false,
      };

  const centreX = canvasSize.width / 2;
  const centreY = canvasSize.height / 2;
  const positions = centralImage
    ? computeLayout(map, canvasSize.width, canvasSize.height)
    : new Map();

  // Build a sequence order map for BOIs when sequence mode is active
  const boiSequenceMap = new Map<string, number>();
  if (sequenceMode) {
    const bois = map.branches
      .filter((b) => b.parentId === null)
      .slice()
      .sort((a, b) => {
        const oa = a.numericalOrder ?? Infinity;
        const ob = b.numericalOrder ?? Infinity;
        if (oa !== ob) return oa - ob;
        return map.branches.indexOf(a) - map.branches.indexOf(b);
      });
    bois.forEach((boi, idx) => {
      boiSequenceMap.set(boi.id, boi.numericalOrder ?? idx + 1);
    });
  }

  const hoveredGC = hoveredCodeId ? globalCodes.find((gc) => gc.id === hoveredCodeId) : null;

  const branchNodes: Node[] = map.branches.map((branch: BranchNode) => {
    const computed = positions.get(branch.id) ?? { id: branch.id, x: centreX, y: centreY };
    const custom = nodePositions[branch.id];
    const pos = custom ?? { x: computed.x, y: computed.y };
    const displayBranch = colourBlindMode
      ? { ...branch, color: applyColourBlindTransform(branch.color) }
      : branch;
    const sequenceOrder = sequenceMode && branch.parentId === null
      ? boiSequenceMap.get(branch.id)
      : undefined;
    const codeHighlighted = hoveredGC
      ? branch.codes.some((c) => c.symbol === hoveredGC.symbol)
      : false;
    return {
      id: branch.id,
      type: 'branchLabel',
      position: pos,
      data: {
        branch: displayBranch,
        angle: branch.angle,
        selected: branch.id === selectedBranchId,
        editing: branch.id === editingBranchId,
        onEditCommit: handleEditCommit,
        onBlankClick: handleBlankClick,
        sequenceOrder,
        codeHighlighted,
        codes: branch.codes,
      } satisfies EditableBranchNodeData,
      draggable: true,
      selectable: true,
    };
  });

  const branchEdges: Edge[] = map.branches.map((branch: BranchNode) => {
    const isBoi = branch.parentId === null;
    const sourceId = isBoi ? 'central-image' : branch.parentId!;
    const handleId = isBoi ? pickHandleId(branch.angle) : 'right';
    const sourcePos = isBoi ? handleToPosition(handleId) : Position.Right;
    return {
      id: `edge-${branch.id}`,
      source: sourceId,
      target: branch.id,
      sourceHandle: isBoi ? handleId : undefined,
      type: 'buzanBranch',
      data: { branch },
      sourcePosition: sourcePos,
      targetPosition: Position.Left,
    };
  });

  const onNodeClick: NodeMouseHandler = (_event, node) => {
    if (node.id === 'central-image') { selectBranch(null); return; }
    // Arrow mode: first click = source, second click = target
    if (arrowMode) {
      if (!arrowSourceId) {
        setArrowSource(node.id);
        return;
      } else if (arrowSourceId !== node.id) {
        addArrow(arrowSourceId, node.id);
        return;
      }
      return;
    }
    // In sequence mode, assign the next numerical order to the clicked BOI
    if (sequenceMode) {
      const branch = map.branches.find((b) => b.id === node.id);
      if (branch && branch.parentId === null) {
        assignNumericalOrder(node.id, nextOrder);
        setNextOrder((n) => n + 1);
        return;
      }
    }
    selectBranch(node.id);
  };

  const onNodeContextMenu: NodeMouseHandler = (event, node) => {
    event.preventDefault();
    if (node.id === 'central-image') return;
    setContextMenu({ nodeId: node.id, x: event.clientX, y: event.clientY });
  };

  const onNodeDoubleClick: NodeMouseHandler = (_event, node) => {
    if (node.id === 'central-image') return;
    selectBranch(node.id);
    setEditingBranch(node.id);
  };

  const onNodeDragStop: NodeDragHandler = (_event, node) => {
    if (node.id !== 'central-image') {
      updateNodePosition(node.id, node.position.x, node.position.y);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Toolbar — always visible at the top of the viewport */}
      <div
        style={{
          height: 48,
          minHeight: 48,
          background: '#1e293b',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0 16px',
          flexShrink: 0,
        }}
      >
        <span style={{ fontFamily: KEYWORD_FONT_FAMILY, fontSize: 14 }}>BMM Editor</span>
        <button
          data-testid="stuck-btn"
          onClick={() => setShowMentalBlock((v) => !v)}
          style={{
            padding: '4px 10px',
            cursor: 'pointer',
            fontSize: 12,
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: 4,
          }}
        >
          💭 I&apos;m Stuck
        </button>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 12, opacity: 0.7 }} data-testid="branch-count">
          Branches: {map.branches.length}
        </span>
        <button
          onClick={() => {
            toggleSequenceMode();
            setNextOrder(1);
          }}
          data-testid="sequence-mode-toggle"
          aria-pressed={sequenceMode}
          style={{
            padding: '4px 10px',
            cursor: 'pointer',
            fontSize: 12,
            background: sequenceMode ? '#7c3aed' : '#455a64',
            color: 'white',
            border: 'none',
            borderRadius: 4,
          }}
        >
          🔢 Sequence
        </button>
        <button
          data-testid="draw-arrow-tool"
          onClick={toggleArrowMode}
          aria-pressed={arrowMode}
          style={{
            padding: '4px 10px',
            cursor: 'pointer',
            fontSize: 12,
            background: arrowMode ? '#b45309' : '#455a64',
            color: 'white',
            border: 'none',
            borderRadius: 4,
          }}
        >
          ↗ Arrow {arrowMode && arrowSourceId ? '(select target)' : arrowMode ? '(select source)' : ''}
        </button>
        <button
          data-testid="code-library-btn"
          onClick={() => setShowCodeLibrary((v) => !v)}
          style={{
            padding: '4px 10px',
            cursor: 'pointer',
            fontSize: 12,
            background: showCodeLibrary ? '#7c3aed' : '#455a64',
            color: 'white',
            border: 'none',
            borderRadius: 4,
          }}
        >
          🏷 Codes
        </button>
        {selectedBranchId && (
          <button
            data-testid="mini-burst-btn"
            onClick={() => setShowMiniBurst(true)}
            style={{
              padding: '4px 10px',
              cursor: 'pointer',
              fontSize: 12,
              background: '#0891b2',
              color: 'white',
              border: 'none',
              borderRadius: 4,
            }}
          >
            💥 Mini Burst
          </button>
        )}
        <button
          onClick={() => {
            if (map) setOutlineText(generateLinearOutline(map));
          }}
          data-testid="export-outline-btn"
          style={{
            padding: '4px 10px',
            cursor: 'pointer',
            fontSize: 12,
            background: '#0f766e',
            color: 'white',
            border: 'none',
            borderRadius: 4,
          }}
        >
          📋 Export Outline
        </button>
        <button
          onClick={() => addBlankLine(selectedBranchId)}
          data-testid="add-branch"
          style={{
            padding: '4px 10px',
            cursor: hasCentralImage ? 'pointer' : 'not-allowed',
            fontSize: 12,
            opacity: hasCentralImage ? 1 : 0.4,
          }}
        >
          + Add Branch
        </button>
        <button
          onClick={() => addBlankLine(selectedBranchId)}
          data-testid="add-blank-line-btn"
          style={{ padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}
        >
          + Blank Line
        </button>
        {/* LE-022: Colour change button — blocked for sub-branches */}
        {selectedBranchId && (() => {
          const selBranch = map.branches.find((b) => b.id === selectedBranchId);
          const isSubBranch = selBranch && selBranch.depth > 0;
          return (
            <div style={{ position: 'relative' }}>
              <button
                data-testid="branch-color-btn"
                onClick={() => {
                  if (isSubBranch) {
                    setColorInheritTooltipId(selectedBranchId);
                  } else {
                    setColorInheritTooltipId(null);
                  }
                }}
                style={{ padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}
              >
                🎨 Color
              </button>
              {colorInheritTooltipId === selectedBranchId && isSubBranch && (
                <div
                  data-testid="color-inherit-tooltip"
                  style={{
                    position: 'absolute',
                    top: 36,
                    right: 0,
                    background: '#1e293b',
                    color: 'white',
                    borderRadius: 6,
                    padding: '8px 12px',
                    fontSize: 12,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    zIndex: 2000,
                    maxWidth: 320,
                    whiteSpaceCollapse: 'preserve',
                  }}
                >
                  Sub-branches inherit their BOI colour. Use Personal Style Mode to override.
                  <button
                    onClick={() => setColorInheritTooltipId(null)}
                    style={{
                      marginLeft: 8,
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          );
        })()}
        <button
          onClick={undo}
          disabled={past.length === 0}
          data-testid="undo-btn"
          style={{ padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}
        >
          ↩ Undo
        </button>
        <button
          onClick={redo}
          data-testid="redo-btn"
          style={{ padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}
        >
          ↪ Redo
        </button>
        {/* Orientation control (LE-062) */}
        <button
          onClick={() => setOrientation('PORTRAIT')}
          data-testid="orientation-portrait-btn"
          style={{ padding: '4px 10px', cursor: 'pointer', fontSize: 12, opacity: 0.7 }}
          title="Buzan recommends landscape — this will be blocked"
        >
          ↕ Portrait
        </button>
        <button
          onClick={() => setColourBlindMode((v) => !v)}
          data-testid="colour-blind-toggle"
          style={{
            padding: '4px 10px',
            cursor: 'pointer',
            fontSize: 12,
            background: colourBlindMode ? '#1565C0' : '#455a64',
            color: 'white',
            border: 'none',
            borderRadius: 4,
          }}
          aria-pressed={colourBlindMode}
          title="Toggle colour-blindness accessibility mode"
        >
          ♿ A11y
        </button>
        <button
          onClick={() => setShowHealthPanel((v) => !v)}
          data-testid="health-panel-open-btn"
          style={{ padding: '4px 10px', cursor: 'pointer', fontSize: 12, background: '#1e88e5', color: 'white', border: 'none', borderRadius: 4 }}
        >
          ❤ Health
        </button>
        <span data-testid="selected-branch-id" style={{ display: 'none' }}>
          {selectedBranchId ?? ''}
        </span>
        <span data-testid="orientation-display" style={{ display: 'none' }}>
          {map.orientation}
        </span>
      </div>

      {/* Canvas — fills remaining viewport height */}
      <div style={{ flex: 1, position: 'relative' }} data-testid="canvas-ready">
        {/* LE-002: Text-image coaching notification */}
        {isTextImage && <TextImageCoaching />}

        {/* Mental Block Panel */}
        {showMentalBlock && (
          <MentalBlockPanel
            onClose={() => setShowMentalBlock(false)}
            onMiniBurst={() => setShowMiniBurst(true)}
            onShowBOIWizard={() => setShowBOIWizard(true)}
          />
        )}

        {/* Code Library Panel */}
        {showCodeLibrary && (
          <div
            data-testid="code-library-panel"
            style={{
              position: 'fixed',
              top: 60,
              left: 16,
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: 20,
              width: 300,
              maxHeight: '70vh',
              overflowY: 'auto',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              zIndex: 3500,
              fontFamily: 'sans-serif',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <strong style={{ fontSize: 14 }}>🏷 Code Library</strong>
              <button onClick={() => setShowCodeLibrary(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            {/* Create new code form */}
            <div style={{ marginBottom: 16, padding: 12, background: '#f8fafc', borderRadius: 6 }}>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Name</label>
                <input
                  data-testid="code-name-input"
                  value={newCodeName}
                  onChange={(e) => setNewCodeName(e.target.value)}
                  placeholder="e.g. Action"
                  style={{ width: '100%', padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Symbol</label>
                <input
                  data-testid="code-symbol-input"
                  value={newCodeSymbol}
                  onChange={(e) => setNewCodeSymbol(e.target.value)}
                  placeholder="★"
                  style={{ width: '100%', padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: 4, fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Colour</label>
                <input
                  data-testid="code-color-input"
                  type="color"
                  value={newCodeColor}
                  onChange={(e) => setNewCodeColor(e.target.value)}
                  style={{ width: '100%', height: 32, border: '1px solid #e2e8f0', borderRadius: 4, cursor: 'pointer', padding: 0 }}
                />
              </div>
              <button
                data-testid="add-code-btn"
                onClick={() => {
                  if (newCodeName.trim() && newCodeSymbol.trim()) {
                    addGlobalCode(newCodeName.trim(), newCodeSymbol.trim(), newCodeColor);
                    setNewCodeName('');
                    setNewCodeSymbol('');
                    setNewCodeColor('#E53935');
                  }
                }}
                style={{ width: '100%', padding: '6px 0', background: '#1e293b', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}
              >
                + Add Code
              </button>
            </div>
            {/* List of existing codes */}
            {globalCodes.length === 0 && <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>No codes yet</p>}
            {globalCodes.map((gc) => (
              <div
                key={gc.id}
                data-testid={`code-entry-${gc.name}`}
                onMouseEnter={() => setHoveredCode(gc.id)}
                onMouseLeave={() => setHoveredCode(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 10px',
                  marginBottom: 6,
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  cursor: 'pointer',
                  background: '#fafafa',
                }}
              >
                <span style={{ fontSize: 16, color: gc.color }}>{gc.symbol}</span>
                <span style={{ flex: 1, fontSize: 13 }}>{gc.name}</span>
                <button
                  data-testid={`apply-code-${gc.name}`}
                  onClick={() => {
                    // Read selectedBranchId from store AND from DOM (for Playwright force-click compat)
                    let targetId = useMapStore.getState().selectedBranchId;
                    if (!targetId) {
                      // Check DOM for selected branch label
                      const selEl = document.querySelector('[data-selected="true"][data-testid^="branch-label-"]') as HTMLElement | null;
                      if (selEl) {
                        const tid = selEl.getAttribute('data-testid') ?? '';
                        targetId = tid.replace('branch-label-', '') || null;
                      }
                    }
                    if (!targetId) {
                      // Check body attribute for last clicked branch
                      targetId = document.body.getAttribute('data-last-clicked-branch');
                    }
                    if (!targetId) {
                      // Check ReactFlow selected node
                      const rfSelected = document.querySelector('.react-flow__node.selected') as HTMLElement | null;
                      if (rfSelected) targetId = rfSelected.getAttribute('data-id');
                    }
                    if (targetId) applyGlobalCode(targetId, gc.id);
                  }}
                  style={{
                    padding: '2px 8px',
                    fontSize: 11,
                    background: '#e2e8f0',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Mini Burst Modal */}
        {showMiniBurst && (
          <div
            data-testid="mini-burst-modal"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 4000,
            }}
          >
            <div
              style={{
                background: 'white',
                borderRadius: 10,
                padding: 24,
                width: 480,
                maxHeight: '80vh',
                overflowY: 'auto',
                boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>💥 Mini Mind Map Burst</h3>
                <button onClick={() => { setShowMiniBurst(false); setBurstInputs(Array(10).fill('')); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>
              </div>
              <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
                Type free associations and drag/import them into your map.
                {selectedBranchId && ` They will attach to the selected branch.`}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {burstInputs.map((val, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#94a3b8', width: 20, textAlign: 'right' }}>{i + 1}.</span>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => {
                        const next = [...burstInputs];
                        next[i] = e.target.value;
                        setBurstInputs(next);
                      }}
                      placeholder={`Association ${i + 1}`}
                      style={{
                        flex: 1,
                        padding: '6px 10px',
                        border: '1px solid #e2e8f0',
                        borderRadius: 4,
                        fontSize: 13,
                      }}
                    />
                    <button
                      data-testid={`burst-import-${i}`}
                      onClick={() => {
                        const word = burstInputs[i].trim();
                        if (!word) return;
                        if (selectedBranchId) {
                          addChildBranch(selectedBranchId);
                          // Update the last-added branch's keyword
                          const currentMap = useMapStore.getState().map;
                          if (currentMap) {
                            const lastBranch = currentMap.branches[currentMap.branches.length - 1];
                            if (lastBranch) {
                              updateKeyword(lastBranch.id, word);
                            }
                          }
                        } else {
                          addChildBranch(map.branches[0]?.id ?? '');
                        }
                        const next = [...burstInputs];
                        next[i] = '';
                        setBurstInputs(next);
                      }}
                      style={{
                        padding: '4px 10px',
                        fontSize: 12,
                        background: '#0891b2',
                        color: 'white',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Import
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => { setShowMiniBurst(false); setBurstInputs(Array(10).fill('')); }}
                  style={{ padding: '6px 16px', fontSize: 13, cursor: 'pointer', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 4 }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        <ReactFlow
          nodes={[ciNode, ...branchNodes]}
          edges={branchEdges}
          nodeTypes={NODE_TYPES}
          edgeTypes={EDGE_TYPES}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onNodeDragStop={onNodeDragStop}
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={() => { selectBranch(null); setContextMenu(null); }}
          fitView
          fitViewOptions={{ padding: 0.1 }}
          proOptions={{ hideAttribution: true }}
          nodesDraggable
          nodesConnectable={false}
          elementsSelectable
          panOnDrag
          zoomOnScroll
          style={{ width: '100%', height: '100%' }}
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>

        {blankCoachingId && (
          <BlankBranchCoaching
            branchId={blankCoachingId}
            onClose={() => setBlankCoachingId(null)}
            onEdit={() => {
              selectBranch(blankCoachingId);
              setEditingBranch(blankCoachingId);
              setBlankCoachingId(null);
            }}
          />
        )}

        {/* Health Panel (HP-001, HP-002, HP-003) */}
        {showHealthPanel && (
          <BuzanHealthPanel map={map} />
        )}

        {/* Right-click context menu */}
        {contextMenu && (
          <div
            data-testid="node-context-menu"
            style={{
              position: 'fixed',
              top: contextMenu.y,
              left: contextMenu.x,
              background: 'white',
              border: '1px solid #ccc',
              borderRadius: 6,
              boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
              zIndex: 3000,
              minWidth: 220,
              padding: '4px 0',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              data-testid="ctx-mark-cluster-complete"
              onClick={() => {
                const nodeId = contextMenu.nodeId;
                setContextMenu(null);
                const confirmed = window.confirm('Draw a boundary around this cluster?');
                if (confirmed) {
                  markClusterComplete(nodeId);
                }
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 16px',
                background: 'none',
                border: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              Mark cluster as complete
            </button>
          </div>
        )}

        {/* Outline export modal */}
        {outlineText !== null && (
          <div
            data-testid="outline-export-modal"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 4000,
            }}
          >
            <div
              style={{
                background: 'white',
                borderRadius: 8,
                padding: 24,
                maxWidth: 600,
                width: '90%',
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>Linear Outline Export</h3>
                <button
                  data-testid="outline-export-close"
                  onClick={() => setOutlineText(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}
                >
                  ×
                </button>
              </div>
              <pre
                data-testid="outline-export-text"
                style={{
                  flex: 1,
                  overflow: 'auto',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 4,
                  padding: 16,
                  fontFamily: 'monospace',
                  fontSize: 13,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {outlineText}
              </pre>
            </div>
          </div>
        )}

        {/* WARN toasts */}
        <WarnToast items={warnQueue} onDismiss={dismissWarn} />

        {/* COACH toasts (LE-004, LE-052) */}
        <CoachToast items={coachQueue} onDismiss={dismissCoach} />
      </div>

      {/* BLOCK modal — portal-style, fixed overlay */}
      {blockModal && <BlockModal block={blockModal} onDismiss={dismissBlock} />}

      {/* Clarity modal (LE-060) */}
      {clarityModal && (
        <ClarityModal
          pendingKeyword={clarityModal.pendingKeyword}
          words={clarityModal.words}
          onSplit={commitClaritySplit}
          onKeep={commitClarityKeep}
        />
      )}

      {/* BOI Wizard (LE-081) — shown on new empty maps */}
      {showBOIWizard && (
        <BOIWizard
          onStart={(keywords) => {
            setShowBOIWizard(false);
            populateBOIs(keywords);
          }}
        />
      )}
    </div>
  );
}
