


"use client";

import { Loader2, Sparkles } from "lucide-react";
import { LENGTH_OPTIONS, type LengthSec } from "@/lib/generator";
import { cn } from "@/lib/utils";
import { PromptChips } from "./PromptChips";

export function GeneratorForm({
  prompt,
  onPromptChange,
  lengthSec,
  onLengthChange,
  isGenerating,
  onSubmit,
  onQuickStart,
}: {
  prompt: string;
  onPromptChange: (value: string) => void;
  lengthSec: LengthSec;
  onLengthChange: (value: LengthSec) => void;
  isGenerating: boolean;
  onSubmit: () => void;
  
  onQuickStart: (prompt: string) => void;
}) {
  const canSubmit = prompt.trim().length > 0 && !isGenerating;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit) onSubmit();
      }}
      className="flex flex-col gap-5 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <label
            htmlFor="generator-prompt"
            className="text-xs font-semibold uppercase tracking-wider text-white/50"
          >
            Prompt
          </label>
          <span className="text-[11px] tabular-nums text-white/30">
            {prompt.length}/280
          </span>
        </div>

        <PromptChips disabled={isGenerating} onPick={onQuickStart} />

        <textarea
          id="generator-prompt"
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          maxLength={280}
          rows={4}
          disabled={isGenerating}
          placeholder="Describe the reel — e.g. a push for students who keep postponing the work they care about."
          className="w-full resize-none rounded-lg border border-white/10 bg-black/40 px-3.5 py-3 text-sm leading-relaxed text-foreground transition-colors placeholder:text-white/25 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-ring/40 disabled:opacity-50"
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
          Reel length
        </span>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Reel length">
          {LENGTH_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={option === lengthSec}
              disabled={isGenerating}
              onClick={() => onLengthChange(option)}
              className={cn(
                "rounded-lg border py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40",
                option === lengthSec
                  ? "border-white bg-white text-black"
                  : "border-white/10 bg-white/[0.03] text-white/60 hover:border-white/25 hover:text-white"
              )}
            >
              {option} seconds
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isGenerating ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Sparkles className="size-4" aria-hidden="true" />
        )}
        {isGenerating ? "Generating…" : "Generate reel"}
      </button>

      <p className="text-[11px] leading-relaxed text-white/35">
        The engine picks the closest exact quote from Swami Vivekananda&apos;s
        works and pairs it with a house clip. Demo pipeline — 15 seconds.
      </p>
    </form>
  );
}
