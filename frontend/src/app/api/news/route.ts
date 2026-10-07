





import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; 
export const maxDuration = 60; 

const API_URL = process.env.API_URL;
const ALLOWED_PARAMS = ["q", "sort", "category", "limit"] as const;
const UPSTREAM_TIMEOUT_MS = 55_000;

export async function GET(request: NextRequest) {
  if (!API_URL) {
    return NextResponse.json(
      { error: "API_URL is not configured. Add it to your environment variables." },
      { status: 500 }
    );
  }

  const upstream = new URL("/api/news", API_URL);
  for (const key of ALLOWED_PARAMS) {
    const value = request.nextUrl.searchParams.get(key);
    if (value) upstream.searchParams.set(key, value);
  }

  try {
    const res = await fetch(upstream, {
      cache: "no-store",
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        { error: `News service returned ${res.status}. Try again in a moment.` },
        { status: 502 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "News service is unreachable. It may be waking up — try again in a moment." },
      { status: 502 }
    );
  }
}
