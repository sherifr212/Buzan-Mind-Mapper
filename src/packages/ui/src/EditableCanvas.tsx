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

// ─── EditableCanvas ───────────────────────────────────────────────────────────
// Interactive mind map editor built on React Flow.
// Sprint 6: Tab=child, Enter=sibling, Delete=remove, F2/dblclick=edit,
//           Drag, Ctrl+Z/Shift+Z=undo/redo, toolbar blank-line button.

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
}

function EditableBranchNodeComponent({ data }: NodeProps<EditableBranchNodeData>) {
  const { branch, angle, selected, editing, onEditCommit, onBlankClick } = data;
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
        background: selected ? 'rgba(59,130,246,0.15)' : 'transparent',
        border: selected ? '1px solid rgba(59,130,246,0.6)' : '1px solid transparent',
        borderRadius: 4,
        transform: flip ? 'rotate(180deg)' : undefined,
        transformOrigin: 'center center',
        cursor: 'pointer',
        minWidth: 40,
      }}
      data-testid={`branch-label-${branch.id}`}
      data-selected={selected ? 'true' : 'false'}
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
  } = useMapStore();

  const [blankCoachingId, setBlankCoachingId] = useState<string | null>(null);

  useEffect(() => {
    loadMap(initialMap);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  if (!map) return <div data-testid="canvas-loading">Loading…</div>;

  const { canvasSize, centralImage } = map;
  const positions = computeLayout(map, canvasSize.width, canvasSize.height);
  const centreX = canvasSize.width / 2;
  const centreY = canvasSize.height / 2;

  const ciNode: Node = {
    id: 'central-image',
    type: 'centralImage',
    position: {
      x: centreX - centralImage.size.width / 2,
      y: centreY - centralImage.size.height / 2,
    },
    data: { image: centralImage },
    draggable: false,
    selectable: false,
  };

  const branchNodes: Node[] = map.branches.map((branch: BranchNode) => {
    const computed = positions.get(branch.id) ?? { id: branch.id, x: centreX, y: centreY };
    const custom = nodePositions[branch.id];
    const pos = custom ?? { x: computed.x, y: computed.y };
    return {
      id: branch.id,
      type: 'branchLabel',
      position: pos,
      data: {
        branch,
        angle: branch.angle,
        selected: branch.id === selectedBranchId,
        editing: branch.id === editingBranchId,
        onEditCommit: handleEditCommit,
        onBlankClick: handleBlankClick,
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
    selectBranch(node.id);
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

  const onPaneClick = () => selectBranch(null);

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
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 12, opacity: 0.7 }} data-testid="branch-count">
          Branches: {map.branches.length}
        </span>
        <button
          onClick={() => addBlankLine(selectedBranchId)}
          data-testid="add-blank-line-btn"
          style={{ padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}
        >
          + Blank Line
        </button>
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
        <span data-testid="selected-branch-id" style={{ display: 'none' }}>
          {selectedBranchId ?? ''}
        </span>
      </div>

      {/* Canvas — fills remaining viewport height */}
      <div style={{ flex: 1, position: 'relative' }} data-testid="canvas-ready">
        <ReactFlow
          nodes={[ciNode, ...branchNodes]}
          edges={branchEdges}
          nodeTypes={NODE_TYPES}
          edgeTypes={EDGE_TYPES}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onNodeDragStop={onNodeDragStop}
          onPaneClick={onPaneClick}
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
      </div>
    </div>
  );
}
