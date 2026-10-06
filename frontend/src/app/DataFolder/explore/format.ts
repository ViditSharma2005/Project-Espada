const uploadedDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

/** "Sep 12, 2026". Falls back to the raw string if it is not a date. */
export function formatUploaded(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return uploadedDate.format(date);
}
