/**
 * AT-PWA-046 — NetworkStatusService unit tests
 * All 6 cases:
 * 1. 'online' event sets status to 'online'
 * 2. 'offline' event sets status to 'offline'
 * 3. Three consecutive HEAD failures set status to 'offline' regardless of navigator.onLine
 * 4. Single HEAD success after failures restores status to 'online'
 * 5. Subscribers are notified on every status change
 * 6. Unsubscribed callbacks are not called
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Browser globals mock setup ───────────────────────────────────────────────

const listeners: Record<string, EventListener[]> = {};

const mockWindow = {
  addEventListener: vi.fn((event: string, cb: EventListener) => {
    listeners[event] = listeners[event] ?? [];
    listeners[event].push(cb);
  }),
  removeEventListener: vi.fn((event: string, cb: EventListener) => {
    listeners[event] = (listeners[event] ?? []).filter((l) => l !== cb);
  }),
};

function triggerWindowEvent(event: string) {
  (listeners[event] ?? []).forEach((cb) => cb(new Event(event)));
}

let mockOnline = true;
const mockNavigator = { onLine: true };

vi.stubGlobal('window', mockWindow);
vi.stubGlobal('navigator', { get onLine() { return mockOnline; } });

// Mock setInterval/clearInterval
vi.useFakeTimers();

// ─── Import after globals are stubbed ────────────────────────────────────────

// We use dynamic import so globals are in place
let NetworkStatusService: typeof import('../networkStatus.js').NetworkStatusService;

beforeEach(async () => {
  // Reset listeners
  for (const key of Object.keys(listeners)) delete listeners[key];
  mockOnline = true;

  // Re-import to get fresh module (reset singleton)
  const mod = await import('../networkStatus.js');
  NetworkStatusService = mod.NetworkStatusService;
  NetworkStatusService._reset();
});

afterEach(() => {
  NetworkStatusService._reset();
  vi.restoreAllMocks();
});

// ─── Test Case 1: 'online' event sets status ──────────────────────────────────

describe('AT-PWA-046 NetworkStatusService', () => {
  it('case 1: window online event sets status to online', () => {
    mockOnline = false;
    const svc = NetworkStatusService.getInstance();
    // Manually set offline first
    // @ts-expect-error private
    svc._setStatus('offline');
    expect(svc.status).toBe('offline');

    triggerWindowEvent('online');
    // After online event, status should be 'online'
    expect(svc.status).toBe('online');
  });

  it('case 2: window offline event sets status to offline', () => {
    const svc = NetworkStatusService.getInstance();
    expect(svc.status).toBe('online');

    triggerWindowEvent('offline');
    expect(svc.status).toBe('offline');
  });

  it('case 3: three consecutive HEAD failures set status to offline regardless of navigator.onLine', async () => {
    mockOnline = true;
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')));

    const svc = NetworkStatusService.getInstance();
    expect(svc.status).toBe('online');

    // Simulate 3 ping failures
    // @ts-expect-error private
    await svc._ping();
    expect(svc.status).toBe('degraded');

    // @ts-expect-error private
    await svc._ping();
    expect(svc.status).toBe('degraded');

    // @ts-expect-error private
    await svc._ping();
    expect(svc.status).toBe('offline');
  });

  it('case 4: single HEAD success after failures restores status to online', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')));
    const svc = NetworkStatusService.getInstance();

    // Force to offline
    // @ts-expect-error private
    svc._consecutiveFailures = 3;
    // @ts-expect-error private
    svc._setStatus('offline');
    expect(svc.status).toBe('offline');

    // Now mock successful response
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
    // @ts-expect-error private
    await svc._ping();
    expect(svc.status).toBe('online');
  });

  it('case 5: subscribers are notified on every status change', () => {
    const svc = NetworkStatusService.getInstance();
    const listener = vi.fn();
    svc.subscribe(listener);

    triggerWindowEvent('offline');
    expect(listener).toHaveBeenCalledWith('offline');

    triggerWindowEvent('online');
    expect(listener).toHaveBeenCalledWith('online');

    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('case 6: unsubscribed callbacks are not called', () => {
    const svc = NetworkStatusService.getInstance();
    const listener = vi.fn();
    const unsub = svc.subscribe(listener);

    triggerWindowEvent('offline');
    expect(listener).toHaveBeenCalledTimes(1);

    unsub();
    triggerWindowEvent('online');
    expect(listener).toHaveBeenCalledTimes(1); // not called again
  });
});
