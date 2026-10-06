// Catalog for Explore, and for any later page that needs the same reels.
// How to add one: src/app/DataFolder/README.md

import raw from "./catalog.json";
import type { Reel } from "../types";

function isReel(value: unknown): value is Reel {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  const media = row.media as Record<string, unknown> | undefined;
  const speaker = row.speaker as Record<string, unknown> | undefined;
  const uploader = row.uploader as Record<string, unknown> | undefined;

  return (
    row.kind === "reel" &&
    typeof row.id === "string" &&
    row.id.length > 0 &&
    typeof row.title === "string" &&
    typeof row.description === "string" &&
    typeof row.uploadedAt === "string" &&
    !!media &&
    typeof media.src === "string" &&
    media.mimeType === "video/mp4" &&
    !!speaker &&
    typeof speaker.id === "string" &&
    typeof speaker.name === "string" &&
    !!uploader &&
    typeof uploader.id === "string" &&
    typeof uploader.name === "string"
  );
}

export const reels: Reel[] = (raw as unknown[]).filter(isReel);

export function getReel(id: string): Reel | undefined {
  return reels.find((reel) => reel.id === id);
}

export function reelsBySpeaker(speakerId: string): Reel[] {
  return reels.filter((reel) => reel.speaker.id === speakerId);
}

export function reelsByUploader(uploaderId: string): Reel[] {
  return reels.filter((reel) => reel.uploader.id === uploaderId);
}

/** Path that opens this reel. Share buttons and other pages should use this. */
export function reelHref(id: string): string {
  return `/explore?reel=${encodeURIComponent(id)}`;
}
