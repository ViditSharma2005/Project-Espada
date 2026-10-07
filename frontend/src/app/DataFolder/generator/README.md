# Generator corpus

Exact quotes the Reel Generator (`/generator`) matches prompts against.

`quotes.json` is a **seed** — four entries lifted from the Explore catalog
(`DataFolder/explore/reels/catalog.json`) so the demo works out of the box.
Replace and extend it with a properly sourced file. The page picks up the new
file automatically; invalid rows are dropped with a console warning, never a
crash.

## Regenerate / grow the corpus

1. Copy the prompt below into a strong LLM (Claude / GPT-4 class).
2. Save the raw JSON output as `quotes.json` in this folder.
3. Spot-check 3-4 quotes against their linked sources before a demo. Only
   exact, traceable quotes belong here — the reel overlays the quote
   verbatim, so a paraphrase is a bug.

### Prompt

```
You are preparing data for a hackathon feature: a "reel generator" that turns
a user's prompt into a short video built around an EXACT quote of Swami
Vivekananda.

Produce ONE JSON file: an array of 40-50 objects, each shaped exactly like:

{
  "id": "kebab-case-unique-id",
  "quote": "the exact quote, verbatim",
  "title": "3-5 word reel title",
  "work": "book / lecture / letter it comes from, with year (e.g. 'Karma Yoga (1896)' or 'Letter to Alasinga, 1894')",
  "url": "link where the quote can be verified (Complete Works on wisdomlib.org / wikisource.org / ramakrishnavivekananda.info)",
  "themes": ["5-12 lowercase single-word keywords a user's prompt might contain, include common variants like 'fear', 'doubt', 'doubts'"],
  "description": "Markdown. FIRST LINE must be '> <the exact quote>'. Then a blank line, then 2-3 short sentences of context in simple English.",
  "mediaId": "one of: arise-awake | live-for-others | strength-is-life | the-gymnasium",
  "tags": ["2-4 short tags"]
}

HARD RULES
- Every quote must be traceable to The Complete Works of Swami Vivekananda
  or an authenticated letter/speech. If you are not certain it is verbatim,
  LEAVE IT OUT. No paraphrases, no internet-misattributed lines.
- "quote" must be character-exact against the source you link.
- Spread the set across these themes: courage, action/work, strength,
  self-belief, fear, failure, persistence, service, education, focus,
  youth/students, discipline.
- The audience is Indian college students — keep descriptions simple,
  direct, secular-friendly.
- Output raw JSON only: no markdown fences, no comments, no trailing commas.
```

## Schema notes

- Types live in `./types.ts`. `mediaId` must be one of the four house clips
  under `frontend/public/DataFolder/reels/media/` — when you add real clips,
  extend `QuoteMediaId` in `types.ts` and `MEDIA_IDS` in `index.ts` to match.
- `description` is what Explore's reading pane renders. First line is the
  `>` quote block, following the DataFolder convention.
- `themes` drive `matchQuote()` in `src/lib/generator.ts`. Single lowercase
  words work best; include variants (fear/fears, doubt/doubts,
  procrastinate/procrastinating) because matching is prefix-based.
