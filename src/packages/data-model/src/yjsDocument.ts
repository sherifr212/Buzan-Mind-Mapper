import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { WebsocketProvider } from 'y-websocket';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface YjsNodeData {
  label: string;
  color?: string;
  fontWeight?: string;
  fontSize?: number;
  imageUrl?: string;
  x?: number;
  y?: number;
}

export interface YjsEdgeData {
  source: string;
  target: string;
  curved?: boolean;
}

// ─── YjsMapDocument ──────────────────────────────────────────────────────────

/**
 * Wraps a Y.Doc with typed accessors for a mind map document.
 *
 * Document structure:
 *   Y.Map('meta')    — title, theme, settings
 *   Y.Map('nodes')   — keyed by nodeId → Y.Map of node properties
 *   Y.Map('edges')   — keyed by edgeId → Y.Map of edge properties
 *   Y.Array('history') — append-only audit log
 */
export class YjsMapDocument {
  readonly doc: Y.Doc;
  readonly meta: Y.Map<unknown>;
  readonly nodes: Y.Map<Y.Map<unknown>>;
  readonly edges: Y.Map<Y.Map<unknown>>;
  readonly history: Y.Array<object>;

  private _idbPersistence: IndexeddbPersistence | null = null;
  private _wsProvider: WebsocketProvider | null = null;

  constructor(public readonly mapId: string) {
    this.doc = new Y.Doc();
    this.meta = this.doc.getMap('meta');
    this.nodes = this.doc.getMap<Y.Map<unknown>>('nodes');
    this.edges = this.doc.getMap<Y.Map<unknown>>('edges');
    this.history = this.doc.getArray<object>('history');
  }

  /** Attach IndexedDB persistence (offline durability). */
  attachIndexedDb(): IndexeddbPersistence {
    if (!this._idbPersistence) {
      this._idbPersistence = new IndexeddbPersistence(`bmm-yjs-${this.mapId}`, this.doc);
    }
    return this._idbPersistence;
  }

  /**
   * Connect to the server Yjs WebSocket endpoint.
   * @param serverUrl Base WebSocket URL (e.g., wss://app.example.com)
   */
  attachWebSocket(serverUrl: string): WebsocketProvider {
    if (!this._wsProvider) {
      this._wsProvider = new WebsocketProvider(
        serverUrl,
        `map-${this.mapId}`,
        this.doc,
        { connect: true },
      );
    }
    return this._wsProvider;
  }

  /** Detach both providers and destroy the doc. */
  destroy(): void {
    this._wsProvider?.destroy();
    this._idbPersistence?.destroy();
    this.doc.destroy();
  }

  // ─── Typed node accessors ─────────────────────────────────────────────────

  setNode(nodeId: string, data: YjsNodeData): void {
    this.doc.transact(() => {
      let yNode = this.nodes.get(nodeId);
      if (!yNode) {
        yNode = new Y.Map<unknown>();
        this.nodes.set(nodeId, yNode);
      }
      Object.entries(data).forEach(([k, v]) => yNode!.set(k, v));
    });
  }

  deleteNode(nodeId: string): void {
    this.doc.transact(() => {
      this.nodes.delete(nodeId);
    });
  }

  getNode(nodeId: string): YjsNodeData | undefined {
    const yNode = this.nodes.get(nodeId);
    if (!yNode) return undefined;
    return Object.fromEntries(yNode.entries()) as unknown as YjsNodeData;
  }

  // ─── Typed edge accessors ─────────────────────────────────────────────────

  setEdge(edgeId: string, data: YjsEdgeData): void {
    this.doc.transact(() => {
      let yEdge = this.edges.get(edgeId);
      if (!yEdge) {
        yEdge = new Y.Map<unknown>();
        this.edges.set(edgeId, yEdge);
      }
      Object.entries(data).forEach(([k, v]) => yEdge!.set(k, v));
    });
  }

  deleteEdge(edgeId: string): void {
    this.doc.transact(() => {
      this.edges.delete(edgeId);
    });
  }

  // ─── Meta accessors ───────────────────────────────────────────────────────

  setTitle(title: string): void {
    this.meta.set('title', title);
  }

  getTitle(): string {
    return (this.meta.get('title') as string) ?? 'Untitled';
  }

  // ─── Snapshot helpers ─────────────────────────────────────────────────────

  encodeStateAsUpdate(): Uint8Array {
    return Y.encodeStateAsUpdate(this.doc);
  }

  applyUpdate(update: Uint8Array): void {
    Y.applyUpdate(this.doc, update);
  }

  encodeStateVector(): Uint8Array {
    return Y.encodeStateVector(this.doc);
  }
}
