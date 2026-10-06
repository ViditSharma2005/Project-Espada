"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";
import type { Reel } from "@/app/DataFolder/explore";
import { iconButton } from "./styles";

type ReelSlideProps = {
  reel: Reel;
  active: boolean;
  attached: boolean;
  muted: boolean;
  volume: number;
  onToggleMuted: () => void;
  onVolume: (value: number) => void;
  onAutoplayBlocked: () => void;
};

export function ReelSlide({
  reel,
  active,
  attached,
  muted,
  volume,
  onToggleMuted,
  onVolume,
  onAutoplayBlocked,
}: ReelSlideProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !attached) return;

    video.volume = volume;
    video.muted = muted || volume === 0;

    if (!active) {
      video.pause();
      return;
    }

    const pending = video.play();
    pending
      ?.then(() => setPaused(false))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (!video.muted) onAutoplayBlocked();
        else setPaused(true);
      });
  }, [active, attached, muted, volume, onAutoplayBlocked]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || !active) return;
    if (video.paused) {
      video.play().then(() => setPaused(false)).catch(() => setPaused(true));
    } else {
      video.pause();
      setPaused(true);
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center px-3 sm:px-12">
      <div className="relative h-full max-h-full w-auto max-w-full aspect-[9/16] overflow-hidden border border-white/10 bg-black">
        {attached ? (
          <video
            ref={videoRef}
            src={reel.media.src}
            className="h-full w-full object-cover"
            playsInline
            loop
            preload={active ? "auto" : "metadata"}
            muted={muted}
            onError={() => setFailed(true)}
            onTimeUpdate={(event) => {
              const video = event.currentTarget;
              if (!video.duration) return;
              setProgress(video.currentTime / video.duration);
            }}
          />
        ) : (
          <div className="h-full w-full bg-black" />
        )}

        {failed && (
          <div className="absolute inset-0 flex items-center justify-center bg-black px-5 text-center">
            <p className="text-xs leading-5 text-muted-foreground">
              Missing file
              <span className="mt-1 block font-mono text-[11px] text-foreground/70">
                {reel.media.src}
              </span>
            </p>
          </div>
        )}

        {active && !failed && (
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

        {active && !failed && (
          <div
            className="absolute bottom-3 left-3 z-10 flex items-center gap-1 rounded-md bg-black/55 py-0.5 pl-0.5 pr-2"
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={onToggleMuted}
              aria-label={muted || volume === 0 ? "Unmute" : "Mute"}
              aria-pressed={muted || volume === 0}
              className={iconButton}
            >
              {muted || volume === 0 ? (
                <VolumeX className="size-4" />
              ) : (
                <Volume2 className="size-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              aria-label="Volume"
              onChange={(event) => onVolume(Number(event.target.value))}
              className="h-1 w-16 cursor-pointer accent-white sm:w-20"
            />
          </div>
        )}

        {active && !failed && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-white/15">
            <div
              className="h-full bg-white/80"
              style={{ width: `${Math.min(100, progress * 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
