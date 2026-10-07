// Shared record types for the Reel Generator. Import these from other modules
// instead of redefining shapes for the same quote row.

export type QuoteMediaId =
  | "arise-awake"
  | "live-for-others"
  | "strength-is-life"
  | "the-gymnasium";

export type QuoteEntry = {
  /** Stable kebab-case id (unique per quote). */
  id: string;
  /** EXACT quote, verbatim. The reel overlays this text — never a paraphrase. */
  quote: string;
  /** Short reel title, 3-5 words. */
  title: string;
  /** Where the quote comes from — book / lecture / letter, with year when known. */
  work: string;
  /** Link where the quote can be verified (Complete Works, Wikisource, ...). */
  url?: string;
  /** Lowercase keywords a user prompt may contain. Drives the matcher. */
  themes: string[];
  /** Markdown for the Explore reading pane. First line must be `> <quote>`. */
  description: string;
  /** House clip this quote pairs with, under /DataFolder/reels/media. */
  mediaId: QuoteMediaId;
  /** Short tags carried onto the Explore record. */
  tags?: string[];
};
