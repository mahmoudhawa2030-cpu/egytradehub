import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (!q.trim()) return NextResponse.json([]);

  try {
    // Datamuse: returns words/phrases that follow the query — good for product search suggestions
    const url = `https://api.datamuse.com/sug?s=${encodeURIComponent(q)}&max=8`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    const data: { word: string }[] = await res.json();
    const suggestions = data.map((d) => d.word);
    return NextResponse.json(suggestions);
  } catch {
    return NextResponse.json([]);
  }
}
