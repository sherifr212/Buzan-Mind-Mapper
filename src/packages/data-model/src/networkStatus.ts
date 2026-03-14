import type { NetworkStatus } from './db';

type NetworkStatusListener = (status: NetworkStatus) => void;

const HEALTH_ENDPOINT = '/api/health';
const PING_INTERVAL_MS = 30_000;
const CONSECUTIVE_FAILURES_FOR_OFFLINE = 3;

/**
 * Singleton NetworkStatusService.
 *
 * Uses navigator.onLine + periodic HEAD /api/health pings:
 * - Three consecutive failures → 'offline'
 * - First success after failures → 'online'
 * - One or two failures → 'degraded'
 */
export class NetworkStatusService {
  private static _instance: NetworkStatusService | null = null;

  private _status: NetworkStatus = navigator.onLine ? 'online' : 'offline';
  private _listeners: Set<NetworkStatusListener> = new Set();
  private _consecutiveFailures = 0;
  private _pingTimer: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    window.addEventListener('online', () => this._handleOnline());
    window.addEventListener('offline', () => this._setStatus('offline'));
    this._startPinging();
  }

  static getInstance(): NetworkStatusService {
    if (!NetworkStatusService._instance) {
      NetworkStatusService._instance = new NetworkStatusService();
    }
    return NetworkStatusService._instance;
  }

  /** For testing: reset the singleton. */
  static _reset(): void {
    NetworkStatusService._instance?.destroy();
    NetworkStatusService._instance = null;
  }

  get status(): NetworkStatus {
    return this._status;
  }

  get isOnline(): boolean {
    return this._status === 'online';
  }

  get isOffline(): boolean {
    return this._status === 'offline';
  }

  subscribe(listener: NetworkStatusListener): () => void {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  private _setStatus(next: NetworkStatus): void {
    if (this._status === next) return;
    this._status = next;
    this._listeners.forEach((l) => l(next));
  }

  private async _ping(): Promise<void> {
    try {
      const resp = await fetch(HEALTH_ENDPOINT, {
        method: 'HEAD',
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      });
      if (resp.ok) {
        this._consecutiveFailures = 0;
        this._setStatus('online');
      } else {
        this._handlePingFailure();
      }
    } catch {
      this._handlePingFailure();
    }
  }

  private _handlePingFailure(): void {
    this._consecutiveFailures++;
    if (this._consecutiveFailures >= CONSECUTIVE_FAILURES_FOR_OFFLINE) {
      this._setStatus('offline');
    } else if (this._consecutiveFailures >= 1) {
      this._setStatus('degraded');
    }
  }

  private _handleOnline(): void {
    this._consecutiveFailures = 0;
    this._setStatus('online');
    // Trigger an immediate ping to verify
    void this._ping();
  }

  private _startPinging(): void {
    this._pingTimer = setInterval(() => void this._ping(), PING_INTERVAL_MS);
  }

  destroy(): void {
    if (this._pingTimer) clearInterval(this._pingTimer);
    this._listeners.clear();
    window.removeEventListener('online', this._handleOnline);
    window.removeEventListener('offline', () => this._setStatus('offline'));
  }
}
