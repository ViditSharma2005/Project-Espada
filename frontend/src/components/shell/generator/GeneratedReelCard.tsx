// src/components/shell/generator/GeneratedReelCard.tsx — the finished reel:
// the house clip with the exact quote overlaid, plus the Explore-shaped
// record it maps to (description, source, tags). Clicking the clip hands
// playback to ReelStagePlayer, which covers the whole section — this card
// pauses its own video while that player is open.

"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { reelHref } from "@/app/DataFolder/explore";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  Check,
  Copy,
  Maximize2,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { MarkdownBody } from "@/components/shell/explore/MarkdownBody";
import { usePlayback } from "@/components/shell/explore/usePlayback";
import type { GeneratedReel } from "@/lib/generator";

const badge =
  "rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/70";

export function GeneratedReelCard({
  reel,
  onReset,
  onExpand,
  videoPaused,
}: {
  reel: GeneratedReel;
  onReset: () => void;
  /** Opens ReelStagePlayer over the whole section. */
  onExpand: () => void;
  /** True while the stage player is open — pauses this preview. */
  videoPaused: boolean;
}) {
  const { record, meta } = reel;
  const { muted, toggleMuted } = usePlayback();
  const [copied, setCopied] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // React's muted attribute is unreliable after first paint — drive the
  // property directly so the shared playback state always wins.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
    if (!videoPaused) video.play().catch(() => {});
  }, [muted, videoPaused]);

  const copyRecord = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(record, null, 2));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setShowJson(true); // clipboard blocked — fall back to manual copy
    }
  };

  return (
    <motion.div
      key="done"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex h-full min-h-[520px] flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-5 md:min-h-0"
    >
      {/* The reel itself — click to play it over this whole section */}
      <div className="group relative mx-auto aspect-[9/16] h-[380px] max-h-[55%] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black md:h-[46%]">
        <video
          ref={videoRef}
          src={record.media.src}
          autoPlay
          muted={muted}
          loop
          playsInline
          className="h-full w-full object-cover"
        />

        <button
          type="button"
          onClick={onExpand}
          aria-label={`Play ${record.title} in the stage`}
          className="absolute inset-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full bg-black/55 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
            <Maximize2 className="size-3.5" aria-hidden="true" />
            Play
          </span>
        </button>

        <div className="pointer-events-none absolute left-3 top-3 flex gap-1.5">
          <span className={badge}>{meta.lengthSec}s</span>
          <span className={badge}>
            {meta.matchScore > 0 ? `match ${meta.matchScore}` : "house pick"}
          </span>
        </div>

        <button
          type="button"
          onClick={toggleMuted}
          aria-label={muted ? "Unmute reel" : "Mute reel"}
          className="absolute bottom-3 right-3 inline-flex size-8 items-center justify-center rounded-full bg-black/60 text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {muted ? (
            <VolumeX className="size-4" aria-hidden="true" />
          ) : (
            <Volume2 className="size-4" aria-hidden="true" />
          )}
        </button>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 pb-4 pt-14">
          <p className="text-[13px] font-medium leading-snug text-white">
            &ldquo;{meta.matched.quote}&rdquo;
          </p>
          <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/50">
            {meta.matched.work}
          </p>
        </div>
      </div>

      {/* The record this reel maps to — same shape Explore reads. */}
      <div className="flex flex-col gap-3.5">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-foreground">
            {record.title}
          </h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Generated just now · pairs with {meta.matched.mediaId}.mp4
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs">
          <div>
            <dt className="text-white/35">Speaker</dt>
            <dd className="mt-0.5 text-foreground">{record.speaker.name}</dd>
          </div>
          <div>
            <dt className="text-white/35">Source</dt>
            <dd className="mt-0.5 text-foreground">{record.source?.work}</dd>
          </div>
          <div>
            <dt className="text-white/35">Length</dt>
            <dd className="mt-0.5 text-foreground">{meta.lengthSec}s (mock cut)</dd>
          </div>
          <div>
            <dt className="text-white/35">Matched on</dt>
            <dd className="mt-0.5 text-foreground">
              {meta.matchedTerms.length > 0
                ? meta.matchedTerms.slice(0, 4).join(", ")
                : "house pick"}
            </dd>
          </div>
        </dl>

        {record.tags && record.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {record.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[10px] text-white/60"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <p className="border-l border-white/15 pl-3 text-xs italic leading-relaxed text-white/45">
          Prompt: {meta.prompt}
        </p>

        <div className="border-t border-white/10 pt-3.5">
          <MarkdownBody
            source={
              meta.explanation || meta.solution
                ? `${record.description}${meta.explanation ? `\n\n## Why this fits your prompt\n\n${meta.explanation}` : ""}${meta.solution ? `\n\n## Your solution\n\n${meta.solution}` : ""}`
                : record.description
            }
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3.5">
          <button
            type="button"
            onClick={copyRecord}
            className="inline-flex items-center gap-1.5 rounded-md bg-white px-3.5 py-2 text-xs font-semibold text-black transition-colors hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {copied ? (
              <Check className="size-3.5" aria-hidden="true" />
            ) : (
              <Copy className="size-3.5" aria-hidden="true" />
            )}
            {copied ? "Copied" : "Copy Explore record"}
          </button>
          <button
            type="button"
            onClick={() => setShowJson((value) => !value)}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-white/70 transition-colors hover:border-white/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {showJson ? "Hide record JSON" : "View record JSON"}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Generate another
          </button>
          <Link
            href={`${reelHref(meta.matched.mediaId)}&generated=1`}
            onClick={() => {
              if (meta.explanation) {
                sessionStorage.setItem(
                  "samvad.generated-explanation",
                  JSON.stringify({
                    reelId: meta.matched.mediaId,
                    explanation: meta.explanation,
                    solution: meta.solution,
                  })
                );
              }
            }}
            className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Open Explore
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>

        {showJson && (
          <pre className="max-h-56 overflow-auto rounded-lg border border-white/10 bg-black/50 p-3 font-mono text-[11px] leading-relaxed text-white/70">
            {JSON.stringify(record, null, 2)}
          </pre>
        )}

        <p className="text-[11px] leading-relaxed text-white/35">
          Paste the record into DataFolder/explore/reels/catalog.json to
          publish this reel on Explore.
        </p>
      </div>
    </motion.div>
  );
}
