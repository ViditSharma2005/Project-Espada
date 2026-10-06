"use client";

import { useEffect, useRef, useState } from "react";
import { Bookmark, Download, Share2 } from "lucide-react";
import { formatUploaded, reelHref, type Reel } from "@/app/DataFolder/explore";
import { cn } from "@/lib/utils";
import { textButton } from "./styles";

type ReelRecordProps = {
  reel: Reel;
  saved: boolean;
  onToggleSave: () => void;
  className?: string;
};

export function ReelRecord({ reel, saved, onToggleSave, className }: ReelRecordProps) {
  const [noticeId, setNoticeId] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const copied = noticeId === reel.id;

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const share = async () => {
    const url = `${window.location.origin}${reelHref(reel.id)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: reel.title, url });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setNoticeId(reel.id);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setNoticeId(null), 1600);
    } catch {
      setNoticeId(null);
    }
  };

  return (
    <section
      aria-label="Reel details"
      className={cn("flex min-h-0 flex-col justify-between gap-3 overflow-y-auto px-5 py-4 sm:px-6", className)}
    >
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">Uploaded by</dt>
          <dd className="mt-1 truncate text-sm text-foreground">{reel.uploader.name}</dd>
          <dd className="mt-0.5 text-xs text-muted-foreground">
            <time dateTime={reel.uploadedAt}>{formatUploaded(reel.uploadedAt)}</time>
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-muted-foreground">Words of</dt>
          <dd className="mt-1 truncate text-sm text-foreground">{reel.speaker.name}</dd>
          {reel.source?.work && (
            <dd className="mt-0.5 truncate text-xs text-muted-foreground">{reel.source.work}</dd>
          )}
        </div>
      </dl>

      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          className={cn(textButton, saved && "text-foreground")}
          aria-pressed={saved}
          aria-label={saved ? "Remove saved reel" : "Save reel"}
          onClick={onToggleSave}
        >
          <Bookmark className={cn("size-3.5", saved && "fill-current")} />
          {saved ? "Saved" : "Save"}
        </button>
        <a
          href={reel.media.src}
          download={`${reel.id}.mp4`}
          className={textButton}
          aria-label="Download reel"
        >
          <Download className="size-3.5" />
          Download
        </a>
        <button type="button" className={textButton} onClick={share} aria-label="Share reel link">
          <Share2 className="size-3.5" />
          {copied ? "Copied" : "Share"}
        </button>
      </div>
    </section>
  );
}
