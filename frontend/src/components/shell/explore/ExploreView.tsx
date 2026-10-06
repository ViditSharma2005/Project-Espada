"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getReel, reels } from "@/app/DataFolder/explore";
import { ReelReading } from "./ReelReading";
import { ReelRecord } from "./ReelRecord";
import { ReelStage } from "./ReelStage";
import { usePlayback } from "./usePlayback";
import { useSavedReels } from "./useSavedReels";

export function ExploreView() {
  const params = useSearchParams();
  const requested = params.get("reel");
  const startId = reels.some((reel) => reel.id === requested)
    ? (requested as string)
    : (reels[0]?.id ?? "");

  const [activeId, setActiveId] = useState(startId);
  const { muted, volume, setMuted, setVolume, toggleMuted } = usePlayback();
  const saved = useSavedReels();
  const reel = getReel(activeId) ?? reels[0];

  useEffect(() => {
    if (!reel) return;
    const next = `/explore?reel=${encodeURIComponent(reel.id)}`;
    if (`${window.location.pathname}${window.location.search}` !== next) {
      window.history.replaceState(null, "", next);
    }
  }, [reel]);

  const onAutoplayBlocked = useCallback(() => {
    setMuted(true);
  }, [setMuted]);

  if (!reel) {
    return (
      <div className="flex h-full items-center px-6 text-sm text-muted-foreground">
        No reels yet.
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-background md:flex-row">
      <ReelStage
        className="h-[56%] md:h-full md:w-1/2"
        reels={reels}
        startId={startId}
        muted={muted}
        volume={volume}
        onActiveChange={setActiveId}
        onToggleMuted={toggleMuted}
        onVolume={setVolume}
        onAutoplayBlocked={onAutoplayBlocked}
      />

      <div className="flex h-[44%] min-h-0 flex-col border-t border-white/10 md:h-full md:w-1/2 md:border-l md:border-t-0">
        <ReelReading reel={reel} className="h-[70%]" />
        <ReelRecord
          reel={reel}
          saved={saved.has(reel.id)}
          onToggleSave={() => saved.toggle(reel.id)}
          className="h-[30%] border-t border-white/10"
        />
      </div>
    </div>
  );
}
