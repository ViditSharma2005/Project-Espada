"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Reel } from "@/app/DataFolder/explore";
import { cn } from "@/lib/utils";
import { ReelSlide } from "./ReelSlide";
import { iconButton } from "./styles";

type ReelStageProps = {
  reels: Reel[];
  startId: string;
  muted: boolean;
  volume: number;
  onActiveChange: (id: string) => void;
  onToggleMuted: () => void;
  onVolume: (value: number) => void;
  onAutoplayBlocked: () => void;
  className?: string;
};

export function ReelStage({
  reels,
  startId,
  muted,
  volume,
  onActiveChange,
  onToggleMuted,
  onVolume,
  onAutoplayBlocked,
  className,
}: ReelStageProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const [height, setHeight] = useState(0);
  const [activeId, setActiveId] = useState(startId);

  const index = Math.max(0, reels.findIndex((reel) => reel.id === activeId));

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const measure = () => setHeight(scroller.clientHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (!height || started.current) return;
    const scroller = scrollerRef.current;
    const target = scroller?.querySelector<HTMLElement>(
      `[data-reel-id="${CSS.escape(startId)}"]`
    );
    target?.scrollIntoView({ block: "start" });
    started.current = true;
  }, [height, startId]);

  const select = useCallback(
    (id: string) => {
      setActiveId(id);
      onActiveChange(id);
    },
    [onActiveChange]
  );

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.6)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const id = (best?.target as HTMLElement | undefined)?.dataset.reelId;
        if (id) select(id);
      },
      { root: scroller, threshold: [0.6, 0.8, 1] }
    );

    scroller.querySelectorAll<HTMLElement>("[data-reel-id]").forEach((slide) => {
      observer.observe(slide);
    });
    return () => observer.disconnect();
  }, [reels, select, height]);

  const go = useCallback(
    (delta: number) => {
      const next = reels[index + delta];
      if (!next) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      scrollerRef.current
        ?.querySelector<HTMLElement>(`[data-reel-id="${CSS.escape(next.id)}"]`)
        ?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    },
    [index, reels]
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest("input, textarea, select, [data-reel-reading]")) return;
      if (target.isContentEditable) return;
      event.preventDefault();
      go(event.key === "ArrowDown" ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <section aria-label="Reels" className={cn("relative min-h-0", className)}>
      <div
        ref={scrollerRef}
        className="h-full overflow-y-auto overscroll-y-contain snap-y snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {reels.map((reel, reelIndex) => (
          <div
            key={reel.id}
            data-reel-id={reel.id}
            className="snap-start snap-always"
            style={{ height: height || "100%" }}
          >
            <ReelSlide
              reel={reel}
              active={reel.id === activeId}
              attached={Math.abs(reelIndex - index) <= 1}
              muted={muted}
              volume={volume}
              onToggleMuted={onToggleMuted}
              onVolume={onVolume}
              onAutoplayBlocked={onAutoplayBlocked}
            />
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center sm:right-2">
        <div className="pointer-events-auto flex flex-col items-center gap-1.5">
          <button
            type="button"
            className={iconButton}
            aria-label="Previous reel"
            disabled={index === 0}
            onClick={() => go(-1)}
          >
            <ChevronUp className="size-5" />
          </button>
          {/* <p className="text-[11px] tabular-nums text-muted-foreground">
            {index + 1}/{reels.length}
          </p> */}
          <button
            type="button"
            className={iconButton}
            aria-label="Next reel"
            disabled={index === reels.length - 1}
            onClick={() => go(1)}
          >
            <ChevronDown className="size-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
