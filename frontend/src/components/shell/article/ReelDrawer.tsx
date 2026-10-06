"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Play, Volume2, VolumeX, X } from "lucide-react";
import { reelHref, type Reel } from "@/app/DataFolder/explore";
import type { Article } from "@/app/DataFolder/articles";
import { iconButton } from "@/components/shell/explore/styles";
import { cn } from "@/lib/utils";
import { quietButton } from "./styles";

type ReelDrawerProps = {
  open: boolean;
  article: Article | null;
  reel: Reel | null;
  onClose: () => void;
};

export function ReelDrawer({ open, article, reel, onClose }: ReelDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 40);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const nodes = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!article) return null;

  return (
    <div className={cn("fixed inset-0 z-[70]", open ? "" : "pointer-events-none")}>
      <div
        ref={panelRef}
        role={open ? "dialog" : undefined}
        aria-modal={open ? true : undefined}
        aria-hidden={!open}
        aria-label={open ? `Reel for ${article.title}` : undefined}
        inert={!open}
        className={cn(
          "absolute inset-0 flex flex-col bg-background transition-transform duration-300 ease-in-out motion-reduce:transition-none",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-3 sm:px-4">
          <button ref={closeRef} type="button" onClick={onClose} className={quietButton}>
            <X className="size-4" aria-hidden="true" />
            Close
          </button>
          <p className="min-w-0 truncate text-sm font-medium text-foreground">{article.title}</p>
          {reel ? (
            <Link href={reelHref(reel.id)} className={quietButton}>
              Open on Explore
            </Link>
          ) : (
            <span className="w-16 shrink-0" />
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <p className="shrink-0 px-4 pt-3 text-xs text-muted-foreground lg:hidden">
            {reel
              ? "Playing an existing reel on this topic. Not generated from this page."
              : "No reel is linked."}
          </p>
          <div className="hidden shrink-0 flex-col justify-center px-5 py-5 sm:px-8 lg:flex lg:w-80 lg:px-10">
            <p className="text-xs text-muted-foreground">From Explore</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
              {reel?.title ?? "No reel linked"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {reel
                ? "Playing an existing reel on this topic. A new one is not made from this page yet."
                : "This article has no reel id that matches the Explore catalog."}
            </p>
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center px-4 pb-6 lg:px-8">
            {open && reel ? <ReelPlayer reel={reel} /> : null}
            {open && !reel ? (
              <p className="text-sm text-muted-foreground">Nothing to play.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReelPlayer({ reel }: { reel: Reel }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(true);
  const [failed, setFailed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(0.8);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;
    video.currentTime = 0;
    video.muted = true;
    video.volume = 0.8;
    video
      .play()
      .then(() => {
        if (!cancelled) setPaused(false);
      })
      .catch(() => {
        if (!cancelled) setPaused(true);
      });
    return () => {
      cancelled = true;
      video.pause();
    };
  }, [reel.id]);

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
    <div className="relative aspect-[9/16] h-[min(72dvh,640px)] w-auto max-h-full max-w-full overflow-hidden border border-white/10 bg-black">
      <video
        ref={videoRef}
        src={reel.media.src}
        className="h-full w-full object-cover"
        playsInline
        loop
        preload="auto"
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
            <span className="mt-1 block font-mono text-[11px] text-foreground/70">{reel.media.src}</span>
          </p>
        </div>
      )}

      {!failed && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label={paused ? `Play ${reel.title}` : `Pause ${reel.title}`}
          className="absolute inset-0 cursor-pointer"
        >
          {paused && (
            <span className="pointer-events-none absolute left-1/2 top-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white">
              <Play className="size-5 translate-x-px fill-current" />
            </span>
          )}
        </button>
      )}

      {!failed && (
        <div
          className="absolute bottom-3 left-3 z-10 flex items-center gap-1 rounded-md bg-black/55 py-0.5 pl-0.5 pr-2"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              const video = videoRef.current;
              const next = !(muted || volume === 0);
              if (video) {
                video.muted = next;
                if (!next && video.volume === 0) {
                  video.volume = 0.8;
                  setVolume(0.8);
                }
              }
              setMuted(next);
            }}
            aria-label={muted || volume === 0 ? "Unmute" : "Mute"}
            aria-pressed={muted || volume === 0}
            className={iconButton}
          >
            {muted || volume === 0 ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            aria-label="Volume"
            onChange={(event) => {
              const next = Number(event.target.value);
              const video = videoRef.current;
              if (video) {
                video.volume = next;
                video.muted = next === 0;
              }
              setVolume(next);
              setMuted(next === 0);
            }}
            className="h-1 w-16 cursor-pointer accent-white sm:w-20"
          />
        </div>
      )}

      {!failed && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-white/15">
          <div className="h-full bg-white/80" style={{ width: `${Math.min(100, progress * 100)}%` }} />
        </div>
      )}
    </div>
  );
}
