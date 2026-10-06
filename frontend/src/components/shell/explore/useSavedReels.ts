"use client";

import { useCallback, useSyncExternalStore } from "react";

export const SAVED_REELS_KEY = "explore.savedReels";

const SERVER: string[] = [];

let snapshot: string[] = SERVER;
let loaded = false;
const listeners = new Set<() => void>();

export function readSavedReelIds(): string[] {
  if (typeof window === "undefined") return SERVER;
  try {
    const raw = window.localStorage.getItem(SAVED_REELS_KEY);
    if (!raw) return SERVER;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return SERVER;
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return SERVER;
  }
}

function getSnapshot(): string[] {
  if (!loaded) {
    loaded = true;
    snapshot = readSavedReelIds();
  }
  return snapshot;
}

function emit(next: string[]) {
  snapshot = next;
  window.localStorage.setItem(SAVED_REELS_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSavedReels() {
  const ids = useSyncExternalStore(subscribe, getSnapshot, () => SERVER);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback((id: string) => {
    const current = getSnapshot();
    emit(
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }, []);

  return { ids, has, toggle };
}
