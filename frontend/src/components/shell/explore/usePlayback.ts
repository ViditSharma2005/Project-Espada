"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "explore.playback";

type Playback = { muted: boolean; volume: number };

const SERVER: Playback = { muted: true, volume: 0.8 };

let snapshot: Playback = SERVER;
let loaded = false;
const listeners = new Set<() => void>();

function clampVolume(value: number): number {
  if (Number.isNaN(value)) return 0.8;
  return Math.min(1, Math.max(0, value));
}

function read(): Playback {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return SERVER;
    const parsed = JSON.parse(raw) as Partial<Playback>;
    return {
      muted: parsed.muted !== false,
      volume: clampVolume(typeof parsed.volume === "number" ? parsed.volume : 0.8),
    };
  } catch {
    return SERVER;
  }
}

function getSnapshot(): Playback {
  if (!loaded) {
    loaded = true;
    snapshot = read();
  }
  return snapshot;
}

function emit(next: Playback) {
  snapshot = next;
  window.localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function usePlayback() {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => SERVER);

  const setMuted = useCallback((muted: boolean) => {
    emit({ muted, volume: getSnapshot().volume });
  }, []);

  const setVolume = useCallback((next: number) => {
    const volume = clampVolume(next);
    emit({ muted: volume === 0, volume: volume === 0 ? 0 : volume });
  }, []);

  const toggleMuted = useCallback(() => {
    const current = getSnapshot();
    const muted = !current.muted;
    emit({
      muted,
      volume: !muted && current.volume === 0 ? 0.8 : current.volume,
    });
  }, []);

  return {
    muted: state.muted,
    volume: state.volume,
    setMuted,
    setVolume,
    toggleMuted,
  };
}
