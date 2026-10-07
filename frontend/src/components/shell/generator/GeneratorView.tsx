// src/components/shell/generator/GeneratorView.tsx — the /generator page.
// Section A (60%): quick starts + the prompt form.
// Section B (40%): the stage — blank until a run starts, plays the 15s demo
// pipeline, then shows the reel and the Explore record it maps to.

"use client";

import { useState } from "react";
import { corpus } from "@/app/DataFolder/generator";
import type { LengthSec } from "@/lib/generator";
import { GeneratorForm } from "./GeneratorForm";
import { GenerationStage } from "./GenerationStage";
import { useGenerator } from "./useGenerator";

const STEPS = [
  {
    title: "Describe it",
    body: "One line is enough — an idea, a mood, a message.",
  },
  {
    title: "The engine matches",
    body: "It scans the corpus for the closest exact quote from Swami Vivekananda.",
  },
  {
    title: "The reel is cut",
    body: "A 15s demo pipeline renders the clip and maps its Explore record.",
  },
];

export function GeneratorView() {
  const [prompt, setPrompt] = useState("");
  const [lengthSec, setLengthSec] = useState<LengthSec>(20);
  const { phase, lines, elapsedMs, result, start, reset } = useGenerator();

  const isGenerating = phase === "generating";

  const submit = () => {
    const trimmed = prompt.trim();
    if (trimmed && corpus.length > 0) start(trimmed, lengthSec);
  };

  /** Quick starts generate immediately — no submit needed. */
  const quickStart = (text: string) => {
    setPrompt(text);
    if (corpus.length > 0) start(text, lengthSec);
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-background md:flex-row">
      {/* SECTION A — builder */}
      <section
        aria-label="Reel builder"
        className="flex flex-col gap-6 border-white/10 p-4 sm:p-6 md:w-[60%] md:min-h-0 md:overflow-y-auto md:border-r lg:p-8"
      >
        <header className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/50">
              Demo engine
            </span>
            <span className="text-[10px] uppercase tracking-wider text-white/30">
              {corpus.length} quotes in corpus
            </span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            From prompt to reel
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
            Describe the reel you want. The engine finds the closest exact
            quote from Swami Vivekananda&apos;s works, cuts a short reel
            around it, and maps the record Explore will show.
          </p>
        </header>

        <GeneratorForm
          prompt={prompt}
          onPromptChange={setPrompt}
          lengthSec={lengthSec}
          onLengthChange={setLengthSec}
          isGenerating={isGenerating}
          onSubmit={submit}
          onQuickStart={quickStart}
        />

        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/50">
            How it works
          </h2>
          <ol className="grid gap-3 sm:grid-cols-3">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-3.5"
              >
                <span className="text-[10px] font-semibold text-white/35">
                  0{index + 1}
                </span>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {step.title}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* SECTION B — stage */}
      <section
        aria-label="Generation stage"
        className="flex min-h-0 flex-col md:w-[40%]"
      >
        <GenerationStage
          phase={phase}
          lines={lines}
          elapsedMs={elapsedMs}
          result={result}
          onCancel={reset}
          onReset={reset}
        />
      </section>
    </div>
  );
}
