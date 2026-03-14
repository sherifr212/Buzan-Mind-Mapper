// Offline persistence using localStorage (no cross-package import issues)
// Sprint 15: AT-NF-004

export interface OfflineMap {
  id: string;
  title: string;
  data: string; // serialized .bmm JSON
  updatedAt: string;
  dirty: boolean; // true = needs sync when back online
}

const STORAGE_KEY = 'bmm-offline-maps';

function loadStore(): Record<string, OfflineMap> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, OfflineMap>) : {};
  } catch {
    return {};
  }
}

function saveStore(store: Record<string, OfflineMap>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // storage full or unavailable — ignore
  }
}

export function saveMapOffline(map: OfflineMap): void {
  const store = loadStore();
  store[map.id] = map;
  saveStore(store);
}

export function getOfflineMaps(): OfflineMap[] {
  return Object.values(loadStore());
}

export function markMapSynced(id: string): void {
  const store = loadStore();
  if (store[id]) {
    store[id].dirty = false;
    saveStore(store);
  }
}

export function getDirtyMaps(): OfflineMap[] {
  return Object.values(loadStore()).filter((m) => m.dirty);
}
