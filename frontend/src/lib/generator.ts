// src/lib/generator.ts — the mock generation engine behind /generator.
//
// There is no video model here (yet). The engine does three things:
//   1. matchQuote()       — finds the corpus quote closest to the prompt
//   2. buildStatusLines() — short lines that run during the 15s demo pipeline
//   3. buildGeneratedReel() — assembles an Explore-shaped Reel record, so the
//      generated reel carries the same information (description, source,
//      tags) that /explore shows for hand-made reels.

import { corpus } from "@/app/DataFolder/generator";
import type { QuoteEntry } from "@/app/DataFolder/generator";
import { reels } from "@/app/DataFolder/explore";
import type { Reel } from "@/app/DataFolder/explore";

/** Hardcoded demo pipeline length. A real engine replaces this constant. */
export const GENERATION_MS = 15_000;

export const LENGTH_OPTIONS = [10, 20, 30] as const;
export type LengthSec = (typeof LENGTH_OPTIONS)[number];

export type MatchResult = {
  entry: QuoteEntry;
  score: number;
  terms: string[];
};

export type GeneratedReel = {
  /** The Explore-shaped record — paste it into the catalog to publish. */
  record: Reel;
  /** Everything else the UI wants to know about the run. */
  meta: {
    prompt: string;
    lengthSec: LengthSec;
    matched: QuoteEntry;
    matchScore: number;
    matchedTerms: string[];
    generatedAt: string;
    /** AI explanation shown only on the generated result. */
    explanation?: string;
    /** Prompt-specific, practical answer grounded in the selected reel. */
    solution?: string;
  };
};

const STOP_WORDS = new Set([
  "the", "a", "an", "of", "for", "and", "or", "to", "in", "on", "with",
  "about", "how", "why", "what", "when", "where", "who", "your", "you",
  "i", "my", "me", "we", "our", "us", "is", "are", "be", "been", "am",
  "do", "does", "did", "it", "its", "that", "this", "these", "those",
  "from", "at", "as", "by", "not", "no", "can", "will", "would", "should",
  "could", "their", "they", "them", "his", "her", "he", "she", "him",
  "than", "then", "so", "just", "really", "very", "much", "more", "most",
  "some", "any", "all", "make", "makes", "made", "want", "wants", "need",
  "needs", "like", "get", "gets", "got", "quote", "quotes", "reel",
  "reels", "video", "videos", "short", "clip", "clips", "create",
  "generate", "please", "show", "something", "anything", "thing", "things",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

/**
 * Score every corpus entry against the prompt. Exact theme hit (3) beats a
 * theme word-variant (3, via prefix match) beats the word appearing inside
 * the quote/title/work (1). Ties keep corpus order, so a given corpus makes
 * the matcher deterministic.
 */
const RELATED_TERMS: Record<string, string[]> = {
  procrastination: ["focus", "purpose", "work", "action", "discipline"],
  procrastinate: ["focus", "purpose", "work", "action", "discipline"],
  study: ["study", "learning", "concentration", "focus", "discipline"],
  students: ["study", "learning", "focus", "purpose"],
  motivation: ["purpose", "strength", "courage", "action"],
  stress: ["mind", "meditation", "self control", "strength"],
  distracted: ["distraction", "focus", "attention", "concentration"],
  distraction: ["distraction", "focus", "attention", "concentration"],
  comparison: ["comparison", "envy", "contentment", "independence", "missing out"],
  comparing: ["comparison", "envy", "contentment", "independence", "missing out"],
  anxious: ["fear", "confidence", "strength", "mind", "contentment"],
  anxiety: ["fear", "confidence", "strength", "mind", "contentment"],
  opportunity: ["missing out", "independence", "contentment", "purpose"],
  opportunities: ["missing out", "independence", "contentment", "purpose"],
  missing: ["missing out", "comparison", "contentment", "independence"],
  others: ["comparison", "envy", "contentment", "independence"],
  purpose: ["purpose", "one idea", "duty", "work"],
  helping: ["service", "serve", "help", "compassion", "selfless"],
  community: ["community", "service", "others", "compassion"],
};

function relatedTokens(tokens: string[]): string[] {
  return [...new Set(tokens.flatMap((token) => RELATED_TERMS[token] ?? []))];
}

/**
 * Deterministic multi-factor fallback used when Gemini is unavailable.
 * It considers direct theme hits, phrase hits, title/quote context, and
 * intent synonyms so selection does not collapse to the first catalog row.
 */
export function rankQuotes(
  prompt: string,
  entries: QuoteEntry[] = corpus
): MatchResult[] {
  const tokens = tokenize(prompt);
  const related = relatedTokens(tokens);
  return entries
    .map((entry) => {
      const searchable = `${entry.quote} ${entry.title} ${entry.work} ${entry.description} ${entry.themes.join(" ")} ${(entry.tags ?? []).join(" ")}`.toLowerCase();
      const terms: string[] = [];
      let score = 0;
      for (const token of tokens) {
        const exactTheme = entry.themes.some((theme) => theme.toLowerCase() === token);
        const prefixTheme = entry.themes.some((theme) => {
          const candidate = theme.toLowerCase();
          return token.length >= 4 && candidate.length >= 4 &&
            (candidate.startsWith(token) || token.startsWith(candidate));
        });
        if (exactTheme) { score += 12; terms.push(token); }
        else if (prefixTheme) { score += 8; terms.push(token); }
        else if (searchable.includes(token)) { score += 3; terms.push(token); }
      }
      for (const term of related) {
        if (searchable.includes(term)) { score += 4; if (!terms.includes(term)) terms.push(term); }
      }
      const phraseHits = entry.themes.filter((theme) =>
        theme.includes(" ") && prompt.toLowerCase().includes(theme.toLowerCase())
      );
      score += phraseHits.length * 14;
      terms.push(...phraseHits);
      return { entry, score, terms: [...new Set(terms)] };
    })
    .sort((a, b) => b.score - a.score);
}

export function matchQuote(
  prompt: string,
  entries: QuoteEntry[] = corpus
): MatchResult {
  return rankQuotes(prompt, entries)[0] ?? { entry: entries[0], score: 0, terms: [] };
}

/** Short lines that run inside the frame while the demo pipeline "renders". */
export function buildStatusLines(
  match: MatchResult,
  lengthSec: LengthSec
): string[] {
  return [
    "Reading your prompt",
    "Scanning the Complete Works",
    `Matched: ${match.entry.title}`,
    `From: ${match.entry.work}`,
    "Writing the script",
    `Rendering ${lengthSec}s of frames`,
    "Encoding the reel",
    "Mapping the Explore record",
  ];
}

/** House clip paired with this quote — the same file Explore plays. */
function pairedMedia(entry: QuoteEntry, lengthSec: LengthSec): Reel["media"] {
  const fromCatalog = reels.find((reel) =>
    reel.media.src.endsWith(`/${entry.mediaId}.mp4`)
  );

  return {
    src: `/DataFolder/reels/media/${entry.mediaId}.mp4`,
    mimeType: "video/mp4",
    width: fromCatalog?.media.width ?? 720,
    height: fromCatalog?.media.height ?? 1280,
    durationSec: lengthSec,
  };
}

/**
 * Assemble the generated reel: an Explore-shaped record plus run metadata.
 * The record is deliberately identical in shape to a catalog row, so the
 * copy-to-catalog flow on the result card makes the reel real.
 */
export function buildGeneratedReel(
  match: MatchResult,
  prompt: string,
  lengthSec: LengthSec,
  explanation?: string,
  solution?: string
): GeneratedReel {
  const suffix = Math.random().toString(36).slice(2, 6);
  const generatedAt = new Date().toISOString();

  return {
    record: {
      id: `gen-${match.entry.id}-${suffix}`,
      kind: "reel",
      title: match.entry.title,
      description: match.entry.description,
      media: pairedMedia(match.entry, lengthSec),
      speaker: { id: "swami-vivekananda", name: "Swami Vivekananda" },
      uploader: { id: "reel-generator", name: "Reel Generator" },
      uploadedAt: generatedAt,
      language: "en",
      tags: match.entry.tags,
      source: match.entry.url
        ? { work: match.entry.work, url: match.entry.url }
        : { work: match.entry.work },
    },
    meta: {
      prompt,
      lengthSec,
      matched: match.entry,
      matchScore: match.score,
      matchedTerms: match.terms,
      generatedAt,
      explanation,
      solution,
    },
  };
}
