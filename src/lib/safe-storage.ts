// src/lib/safe-storage.ts
export function storageAvailable(type: 'localStorage' | 'sessionStorage') {
  try {
    const storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (err) {
    // SecurityError / QuotaExceededError u otros
    return false;
  }
}

export const safeStorage = {
  get<T = unknown>(key: string, fallback: T | null = null): T | null {
    try {
      if (typeof window === 'undefined') return fallback;
      if (!storageAvailable('localStorage')) return fallback;
      const raw = window.localStorage.getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`[safeStorage.get] No se pudo leer "${key}"`, err);
      return fallback;
    }
  },
  set(key: string, value: unknown): boolean {
    try {
      if (typeof window === 'undefined') return false;
      if (!storageAvailable('localStorage')) return false;
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.warn(`[safeStorage.set] No se pudo guardar "${key}"`, err);
      return false;
    }
  },
  remove(key: string): void {
    try {
      if (typeof window === 'undefined') return;
      if (!storageAvailable('localStorage')) return;
      window.localStorage.removeItem(key);
    } catch (err) {
      console.warn(`[safeStorage.remove] No se pudo borrar "${key}"`, err);
    }
  },
};
