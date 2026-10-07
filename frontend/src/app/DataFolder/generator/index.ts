







import raw from "./quotes.json";
import type { QuoteEntry, QuoteMediaId } from "./types";

const MEDIA_IDS: QuoteMediaId[] = [
  "spirituality",
  "strength",
  "raja-yoga",
  "fomo",
  "focus",
  "karma-yoga",
  "vedanta",
  "seva",
  "concentration",
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



if (process.env.NODE_ENV !== "production" && valid.length < rows.length) {
  console.warn(
    `[generator] dropped ${rows.length - valid.length} invalid quotes.json row(s)`
  );
}

export const corpus: QuoteEntry[] = valid;
export type { QuoteEntry, QuoteMediaId } from "./types";
