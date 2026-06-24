import { NextRequest, NextResponse } from "next/server";
import { ollamaGenerateJSON } from "@/lib/ollama/client";
import { buildSummaryPrompt, parseSummaryResponse } from "@/lib/prompts/summary";

export async function POST(req: NextRequest) {
  try {
    const { chunks } = await req.json();

    if (!Array.isArray(chunks) || chunks.length === 0) {
      return NextResponse.json({ error: "chunks array is required" }, { status: 400 });
    }

    const raw = await ollamaGenerateJSON(buildSummaryPrompt(chunks));
    const result = parseSummaryResponse(raw);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[summary]", err);
    return NextResponse.json({ error: "요약 중 오류가 발생했습니다." }, { status: 500 });
  }
}
