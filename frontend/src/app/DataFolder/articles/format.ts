const publishedDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

/** "Sep 12, 2026". Falls back to the raw string if it is not a date. */
export function formatPublished(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return publishedDate.format(date);
}

/** Rough sitting length. Not stored, so it cannot drift from the body. */
export function readingMinutes(markdown: string): number {
  const words = markdown
    .replace(/[#>*_`[\]()-]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
