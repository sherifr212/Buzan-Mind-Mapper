import type { MindMap, BranchNode } from '@bmm/data-model';
import { KEYWORD_FONT_FAMILY } from '@bmm/canvas';

// ─── HierarchyOutlineView ──────────────────────────────────────────────────────
// Accessible tree view of the Mind Map hierarchy.
// AT-NF-012: ARIA roles tree (container) and treeitem (each node).

interface HierarchyOutlineViewProps {
  map: MindMap;
  onClose: () => void;
}

interface TreeItemProps {
  branch: BranchNode;
  children: BranchNode[];
  allBranches: BranchNode[];
  depth: number;
}

function TreeItem({ branch, children, allBranches, depth }: TreeItemProps) {
  const hasChildren = children.length > 0;
  return (
    <li
      role="treeitem"
      aria-expanded={hasChildren ? true : undefined}
      aria-level={depth}
      aria-label={`${branch.keyword}, level ${depth}`}
      data-testid={`outline-item-${branch.id}`}
      style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 0 4px ' + (depth * 16) + 'px',
          borderBottom: '1px solid #f1f5f9',
          cursor: 'default',
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: branch.color || '#1e293b',
            flexShrink: 0,
          }}
          aria-hidden="true"
        />
        <span
          style={{
            fontSize: depth === 1 ? 14 : depth === 2 ? 13 : 12,
            fontFamily: KEYWORD_FONT_FAMILY,
            fontWeight: depth === 1 ? 'bold' : 'normal',
            color: '#1e293b',
          }}
        >
          {branch.isUpperCase ? branch.keyword.toUpperCase() : branch.keyword}
        </span>
        <span
          style={{ fontSize: 11, color: '#94a3b8', marginLeft: 'auto' }}
          aria-hidden="true"
        >
          Level {depth}
        </span>
      </div>
      {hasChildren && (
        <ul role="group" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {children.map((child) => (
            <TreeItem
              key={child.id}
              branch={child}
              children={allBranches.filter((b) => b.parentId === child.id)}
              allBranches={allBranches}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function HierarchyOutlineView({ map, onClose }: HierarchyOutlineViewProps) {
  const bois = map.branches.filter((b) => b.parentId === null && !b.blankLine);

  return (
    <div
      data-testid="hierarchy-outline-view"
      role="dialog"
      aria-label="Hierarchy Outline View"
      style={{
        position: 'fixed',
        top: 60,
        right: 0,
        width: 320,
        height: 'calc(100vh - 60px)',
        background: 'white',
        borderLeft: '1px solid #e2e8f0',
        boxShadow: '-4px 0 16px rgba(0,0,0,0.1)',
        overflowY: 'auto',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8fafc',
          flexShrink: 0,
        }}
      >
        <h2
          id="hierarchy-outline-title"
          style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1e293b' }}
        >
          Hierarchy Outline
        </h2>
        <button
          data-testid="hierarchy-outline-close"
          onClick={onClose}
          aria-label="Close Hierarchy Outline"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 20,
            color: '#64748b',
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
      <ul
        role="tree"
        aria-label="Mind Map Hierarchy"
        aria-labelledby="hierarchy-outline-title"
        style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1 }}
      >
        {bois.length === 0 && (
          <li
            role="treeitem"
            style={{ padding: '16px', color: '#94a3b8', fontSize: 13, textAlign: 'center' }}
          >
            No branches yet
          </li>
        )}
        {bois.map((boi) => (
          <TreeItem
            key={boi.id}
            branch={boi}
            children={map.branches.filter((b) => b.parentId === boi.id && !b.blankLine)}
            allBranches={map.branches}
            depth={1}
          />
        ))}
      </ul>
    </div>
  );
}
