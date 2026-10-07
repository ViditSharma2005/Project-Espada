// Corpus for the Reel Generator — the exact quotes the engine matches
// prompts against.
//
// quotes.json is a SEED built from the Explore catalog (DataFolder/explore/
// reels/catalog.json) so the demo works out of the box. Grow it with the
// prompt in this folder's README.md — the page picks up the new file
// automatically.

import raw from "./quotes.json";
import type { QuoteEntry, QuoteMediaId } from "./types";

const MEDIA_IDS: QuoteMediaId[] = [
  "arise-awake",
  "live-for-others",
  "strength-is-life",
  "the-gymnasium",
];

function isQuoteEntry(value: unknown): value is QuoteEntry {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    row.id.length > 0 &&
    typeof row.quote === "string" &&
    row.quote.length > 0 &&
    typeof row.title === "string" &&
    typeof row.work === "string" &&
    Array.isArray(row.themes) &&
    row.themes.length > 0 &&
    row.themes.every((theme) => typeof theme === "string") &&
    typeof row.description === "string" &&
    row.description.length > 0 &&
    typeof row.mediaId === "string" &&
    MEDIA_IDS.includes(row.mediaId as QuoteMediaId)
  );
}

const rows = raw as unknown[];
const valid = rows.filter(isQuoteEntry);

// A hand-edited quotes.json must never take the page down mid-demo —
// invalid rows are dropped with a warning instead of crashing.
if (process.env.NODE_ENV !== "production" && valid.length < rows.length) {
  console.warn(
    `[generator] dropped ${rows.length - valid.length} invalid quotes.json row(s)`
  );
}

export const corpus: QuoteEntry[] = valid;
export type { QuoteEntry, QuoteMediaId } from "./types";
