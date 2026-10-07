// src/components/shell/generator/ReelStagePlayer.tsx — expanded playback.
// Clicking the generated reel opens this over the whole stage (Section B):
// the clip FITS the section (object-contain — never cropped, letterboxed on
// black) with Explore's playback conventions — click to pause/resume, the
// shared explore.playback mute/volume, thin progress bar, and the exact
// quote overlaid. ESC or the close button collapses it back.

"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Play, Volume2, VolumeX, X } from "lucide-react";
import { iconButton } from "@/components/shell/explore/styles";
import { usePlayback } from "@/components/shell/explore/usePlayback";
import { cn } from "@/lib/utils";
import type { GeneratedReel } from "@/lib/generator";

const badge =
  "rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/70";

export function ReelStagePlayer({
  reel,
  onClose,
}: {
  reel: GeneratedReel;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  const [progress, setProgress] = useState(0);
  const { muted, volume, toggleMuted, setVolume } = usePlayback();

  // First-render playback state, captured so the mount effect below can
  // stay dependency-free (it must run exactly once).
  const initial = useRef({ muted, volume });

  // Start right away. If the browser blocks unmuted autoplay, land on the
  // paused state instead of a black frame — same policy as Explore's slides.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = initial.current.volume;
    video.muted = initial.current.muted || initial.current.volume === 0;

    video
      .play()
      .then(() => setPaused(false))
      .catch(() => setPaused(true));

    closeRef.current?.focus();
  }, []);

  // Keep the element in sync with the shared playback store.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = muted || volume === 0;
  }, [muted, volume]);

  // ESC closes — but never while the user is typing in the form.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select")) return;
      event.preventDefault();
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setPaused(false)).catch(() => setPaused(true));
    } else {
      video.pause();
      setPaused(true);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      aria-label={`${reel.record.title} player`}
      className="absolute inset-0 z-20 bg-black"
    >
      <video
        ref={videoRef}
        src={reel.record.media.src}
        className="absolute inset-0 h-full w-full bg-black object-contain"
        playsInline
        loop
        muted={muted}
        onError={() => setFailed(true)}
        onTimeUpdate={(event) => {
          const video = event.currentTarget;
          if (!video.duration) return;
          setProgress(video.currentTime / video.duration);
        }}
      />

      {failed && (
        <div className="absolute inset-0 flex items-center justify-center bg-black px-5 text-center">
          <p className="text-xs leading-5 text-muted-foreground">
            Missing file
            <span className="mt-1 block font-mono text-[11px] text-foreground/70">
              {reel.record.media.src}
            </span>
          </p>
        </div>
      )}

      {!failed && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label={paused ? `Play ${reel.record.title}` : `Pause ${reel.record.title}`}
          className="absolute inset-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {paused && (
            <span className="pointer-events-none absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white">
              <Play className="size-5 translate-x-px fill-current" aria-hidden="true" />
            </span>
          )}
        </button>
      )}

      {/* top bar — badges + close */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 bg-gradient-to-b from-black/70 to-transparent p-3">
        <div className="flex flex-wrap gap-1.5">
          <span className={badge}>{reel.meta.lengthSec}s</span>
          <span className={badge}>{reel.record.source?.work}</span>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close player"
          className={cn(iconButton, "pointer-events-auto bg-black/40")}
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      {/* the exact quote */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent px-5 pb-6 pt-16">
        <p className="max-w-md text-sm font-medium leading-snug text-white sm:text-[15px]">
          &ldquo;{reel.meta.matched.quote}&rdquo;
        </p>
        <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/50">
          Swami Vivekananda · {reel.meta.matched.work}
        </p>
      </div>

      {/* mute + volume — shared with Explore via explore.playback */}
      {!failed && (
        <div
          className="absolute bottom-4 left-3 z-10 flex items-center gap-1 rounded-md bg-black/55 py-0.5 pl-0.5 pr-2"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={toggleMuted}
            aria-label={muted || volume === 0 ? "Unmute" : "Mute"}
            aria-pressed={muted || volume === 0}
            className={iconButton}
          >
            {muted || volume === 0 ? (
              <VolumeX className="size-4" aria-hidden="true" />
            ) : (
              <Volume2 className="size-4" aria-hidden="true" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            aria-label="Volume"
            onChange={(event) => setVolume(Number(event.target.value))}
            className="h-1 w-16 cursor-pointer accent-white sm:w-20"
          />
        </div>
      )}

      {/* progress */}
      {!failed && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-white/15">
          <div
            className="h-full bg-white/80"
            style={{ width: `${Math.min(100, progress * 100)}%` }}
          />
        </div>
      )}
    </motion.section>
  );
}
