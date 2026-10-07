import { NextResponse } from "next/server";
import { corpus } from "@/app/DataFolder/generator";
import { matchQuote, rankQuotes } from "@/lib/generator";

export const runtime = "nodejs";

type AiResult = {
  selectedId?: string;
  explanation?: string;
  solution?: string;
  scores?: Record<string, number>;
};

function fallback(prompt: string): AiResult {
  const ranked = rankQuotes(prompt);
  const match = ranked[0] ?? matchQuote(prompt);
  return {
    selectedId: match.entry.id,
    explanation: `This reel is the closest fit because its central idea, “${match.entry.quote}”, directly addresses the situation in your prompt. It turns the problem into a clear principle rather than offering generic motivation.`,
    solution: `Start with one small action connected to “${match.entry.title}” today. Remove the biggest source of friction, work for a focused block, and review what you completed instead of waiting to feel ready. Repeat that action consistently before increasing the goal.`,
    scores: { semanticFit: match.score, intentFit: match.score, practicalFit: match.score },
  };
}

function extractJson(text: string): AiResult | null {
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  try { return JSON.parse(cleaned) as AiResult; } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try { return JSON.parse(match[0]) as AiResult; } catch { return null; }
  }
}

export async function POST(request: Request) {
  let body: { prompt?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const prompt = typeof body.prompt === "string" ? body.prompt.trim().slice(0, 280) : "";
  if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json(fallback(prompt));

  const candidates = corpus.map(({ id, title, quote, themes, description, work, tags }) => ({
    id, title, quote, themes, tags, work, context: description.slice(0, 700),
  }));
  const instruction = `You are the senior content-ranking and coaching layer for a Swami Vivekananda reel generator.

User request: ${prompt}

Evaluate every candidate. Score each candidate from 0 to 10 on these independent dimensions: semanticFit, intentFit, audienceFit, emotionalFit, actionableFit, quoteSupport, and contextFit. Choose the highest overall fit; do not choose by keyword count alone. Resolve ties by audienceFit, then actionableFit. The explanation must identify the user's underlying problem and explain why the selected quote addresses it. The solution must be specific advice for THIS user request, grounded in the selected reel, and must not claim that Vivekananda said anything beyond the supplied quote/context.

Return ONLY JSON in this exact shape:
{"selectedId":"candidate id","scores":{"semanticFit":0,"intentFit":0,"audienceFit":0,"emotionalFit":0,"actionableFit":0,"quoteSupport":0,"contextFit":0},"explanation":"2-4 concise sentences","solution":"3-5 practical sentences directly answering the user"}

Candidates:
${JSON.stringify(candidates)}`;

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
    return NextResponse.json({
      selectedId: parsed.selectedId,
      scores: parsed.scores,
      explanation: parsed.explanation?.slice(0, 900) || fallback(prompt).explanation,
      solution: parsed.solution?.slice(0, 1200) || fallback(prompt).solution,
    });
  } catch {
    return NextResponse.json(fallback(prompt));
  }
}
