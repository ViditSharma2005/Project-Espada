


"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { corpus } from "@/app/DataFolder/generator";
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
  const requestRef = useRef(0);

  const intervalRef = useRef<number | null>(null);

  const stopTicking = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  
  useEffect(() => stopTicking, [stopTicking]);

  const start = useCallback(
    (prompt: string, lengthSec: LengthSec) => {
      stopTicking();

      const localMatch = matchQuote(prompt);
      const requestId = ++requestRef.current;
      setLines(buildStatusLines(localMatch, lengthSec));
      setResult(null);
      setElapsedMs(0);
      setPhase("generating");

      
      
      
      const aiSelection = fetch("/api/generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })
        .then(async (response) => {
          if (!response.ok) return null;
          return (await response.json()) as {
            selectedId?: string;
            explanation?: string;
            solution?: string;
          };
        })
        .catch(() => null);

      const startedAt = performance.now();
      intervalRef.current = window.setInterval(() => {
        const elapsed = performance.now() - startedAt;
        if (elapsed >= GENERATION_MS) {
          stopTicking();
          setElapsedMs(GENERATION_MS);
          void aiSelection.then((ai) => {
            if (requestId !== requestRef.current) return;
            const selected = ai?.selectedId
              ? corpus.find((entry) => entry.id === ai.selectedId)
              : undefined;
            const finalMatch = selected
              ? { entry: selected, score: 100, terms: selected.themes.slice(0, 4) }
              : localMatch;
            setResult(
              buildGeneratedReel(
                finalMatch,
                prompt,
                lengthSec,
                ai?.explanation,
                ai?.solution
              )
            );
            setPhase("done");
          });
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
