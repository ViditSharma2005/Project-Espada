// src/components/shell/generator/useGenerator.ts — owns the generation state
// machine: idle -> generating (15s hardcoded demo pipeline) -> done.

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  buildGeneratedReel,
  buildStatusLines,
  matchQuote,
  GENERATION_MS,
  type GeneratedReel,
  type LengthSec,
} from "@/lib/generator";

export type GeneratorPhase = "idle" | "generating" | "done";

const TICK_MS = 100;

export function useGenerator() {
  const [phase, setPhase] = useState<GeneratorPhase>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [lines, setLines] = useState<string[]>([]);
  const [result, setResult] = useState<GeneratedReel | null>(null);

  const intervalRef = useRef<number | null>(null);

  const stopTicking = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Never leave a stray interval behind if the page unmounts mid-run.
  useEffect(() => stopTicking, [stopTicking]);

  const start = useCallback(
    (prompt: string, lengthSec: LengthSec) => {
      stopTicking();

      const match = matchQuote(prompt);
      setLines(buildStatusLines(match, lengthSec));
      setResult(null);
      setElapsedMs(0);
      setPhase("generating");

      const startedAt = performance.now();
      intervalRef.current = window.setInterval(() => {
        const elapsed = performance.now() - startedAt;
        if (elapsed >= GENERATION_MS) {
          stopTicking();
          setElapsedMs(GENERATION_MS);
          setResult(buildGeneratedReel(match, prompt, lengthSec));
          setPhase("done");
          return;
        }
        setElapsedMs(elapsed);
      }, TICK_MS);
    },
    [stopTicking]
  );

  const reset = useCallback(() => {
    stopTicking();
    setPhase("idle");
    setResult(null);
    setLines([]);
    setElapsedMs(0);
  }, [stopTicking]);

  return { phase, elapsedMs, lines, result, start, reset };
}
