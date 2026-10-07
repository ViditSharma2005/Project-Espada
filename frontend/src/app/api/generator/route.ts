import { NextResponse } from "next/server";
import { corpus } from "@/app/DataFolder/generator";
import { matchQuote } from "@/lib/generator";

export const runtime = "nodejs";

function fallback(prompt: string) {
  const match = matchQuote(prompt);
  return {
    selectedId: match.entry.id,
    explanation: `This reel was selected because its central idea, “${match.entry.quote}”, most closely addresses the request. Use the practical guidance above as a small, concrete way to turn that idea into action.`,
  };
}

function extractJson(text: string): { selectedId?: string; explanation?: string } | null {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(cleaned) as { selectedId?: string; explanation?: string };
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try { return JSON.parse(match[0]) as { selectedId?: string; explanation?: string }; } catch { return null; }
  }
}

export async function POST(request: Request) {
  let body: { prompt?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const prompt = typeof body.prompt === "string" ? body.prompt.trim().slice(0, 280) : "";
  if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json(fallback(prompt));

  const candidates = corpus.map(({ id, title, quote, themes, description, work }) => ({
    id, title, quote, themes, work, context: description.slice(0, 500),
  }));
  const instruction = `You select the single best Swami Vivekananda reel for a user's request. Compare meaning, intent, emotion, audience, and practical usefulness, not just keyword overlap. Return ONLY valid JSON: {"selectedId":"one candidate id","explanation":"2-4 concise sentences explaining why it fits the request and how the quote connects to it"}. Never invent a quote or candidate id. User request: ${prompt}\nCandidates:\n${JSON.stringify(candidates)}`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: instruction }] }], generationConfig: { temperature: 0.2, responseMimeType: "application/json" } }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return NextResponse.json(fallback(prompt));
    const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = text ? extractJson(text) : null;
    const valid = parsed?.selectedId && corpus.some((entry) => entry.id === parsed.selectedId);
    if (!valid) return NextResponse.json(fallback(prompt));
    return NextResponse.json({ selectedId: parsed.selectedId, explanation: parsed.explanation?.slice(0, 700) || fallback(prompt).explanation });
  } catch {
    return NextResponse.json(fallback(prompt));
  }
}
