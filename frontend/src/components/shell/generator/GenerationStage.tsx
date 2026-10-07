// src/components/shell/generator/GenerationStage.tsx — Section B. Three states:
//   idle       — blank slate, nothing in the works
//   generating — the 15s demo pipeline running inside the 9:16 frame
//   done       — delegates to GeneratedReelCard
// Clicking the finished reel expands ReelStagePlayer over this whole section.

"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Clapperboard, X } from "lucide-react";
import { GENERATION_MS, type GeneratedReel } from "@/lib/generator";
import type { GeneratorPhase } from "./useGenerator";
import { GeneratedReelCard } from "./GeneratedReelCard";
import { ReelStagePlayer } from "./ReelStagePlayer";

export function GenerationStage({
  phase,
  lines,
  elapsedMs,
  result,
  onCancel,
  onReset,
}: {
  phase: GeneratorPhase;
  lines: string[];
  elapsedMs: number;
  result: GeneratedReel | null;
  onCancel: () => void;
  onReset: () => void;
}) {
  // Which run's player is open. Tied to the result object (not a boolean)
  // so a NEW run can never inherit an open player from the previous one —
  // when result changes or clears, the player hides on its own.
  const [expandedFor, setExpandedFor] = useState<GeneratedReel | null>(null);
  const playerOpen = phase === "done" && result !== null && expandedFor === result;

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col bg-black/20">
      <AnimatePresence mode="wait">
        {phase === "idle" && <IdleState key="idle" />}
        {phase === "generating" && (
          <GeneratingState
            key="generating"
            lines={lines}
            elapsedMs={elapsedMs}
            onCancel={onCancel}
          />
        )}
        {phase === "done" && result && (
          <GeneratedReelCard
            key="done"
            reel={result}
            onReset={onReset}
            onExpand={() => setExpandedFor(result)}
            videoPaused={playerOpen}
          />
        )}
      </AnimatePresence>

      {/* Expanded playback — covers this entire section, Explore-style. */}
      <AnimatePresence>
        {playerOpen && result && (
          <ReelStagePlayer
            key="player"
            reel={result}
            onClose={() => setExpandedFor(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function IdleState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex h-full min-h-[520px] flex-1 flex-col items-center justify-center px-8 text-center md:min-h-0"
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-muted-foreground">
        <Clapperboard className="size-6" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-semibold">Nothing in the works</h3>
      <p className="mt-1 max-w-56 text-sm leading-6 text-muted-foreground">
        Describe a reel on the left — generation happens here.
      </p>
    </motion.div>
  );
}

function GeneratingState({
  lines,
  elapsedMs,
  onCancel,
}: {
  lines: string[];
  elapsedMs: number;
  onCancel: () => void;
}) {
  const progress = Math.min(elapsedMs / GENERATION_MS, 1);
  const perLine = GENERATION_MS / (lines.length + 1);
  const activeIndex =
    lines.length > 0
      ? Math.min(Math.floor(elapsedMs / perLine), lines.length - 1)
      : 0;
  const firstVisible = Math.max(0, activeIndex - 1);
  const visible = lines
    .slice(firstVisible, activeIndex + 1)
    .map((line, offset) => ({
      line,
      isCurrent: firstVisible + offset === activeIndex,
    }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="flex h-full min-h-[520px] flex-1 flex-col items-center justify-center gap-4 px-6 py-6 md:min-h-0"
    >
      {/* The reel frame the "engine" renders into */}
      <div className="relative aspect-[9/16] h-[380px] max-h-full shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b10] md:h-[58%]">
        {/* moving light — gives the frame life while it renders */}
        <motion.div
          className="absolute -left-10 top-1/4 size-44 rounded-full bg-indigo-500/20 blur-3xl"
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-10 bottom-1/4 size-44 rounded-full bg-amber-500/15 blur-3xl"
          animate={{ x: [0, -60, 0], y: [0, -40, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />

        <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/60">
          Engine
        </span>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel generation"
          className="absolute right-3.5 top-3.5 inline-flex size-7 items-center justify-center rounded-full bg-black/40 text-white/60 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>

        {/* dynamic status lines — short, one at a time, previous fades above */}
        <div
          aria-live="polite"
          className="absolute inset-x-0 bottom-14 top-12 flex flex-col items-center justify-center gap-2.5 px-6 text-center"
        >
          <AnimatePresence mode="popLayout">
            {visible.map(({ line, isCurrent }) => (
              <motion.p
                key={line}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: isCurrent ? 1 : 0.35, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className={
                  isCurrent
                    ? "text-sm font-medium leading-snug text-white"
                    : "text-xs leading-snug text-white/40"
                }
              >
                {line}
              </motion.p>
            ))}
          </AnimatePresence>
        </div>

        {/* progress */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 px-4 pb-4">
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-white transition-[width] duration-150 ease-linear"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-white/40">
            <span>Generating</span>
            <span className="tabular-nums">
              {(elapsedMs / 1000).toFixed(1)}s / {GENERATION_MS / 1000}s
            </span>
          </div>
        </div>
      </div>

      <p className="text-center text-[11px] text-white/30">
        Demo pipeline — hardcoded {GENERATION_MS / 1000}s. A real engine
        replaces this stage.
      </p>
    </motion.div>
  );
}
