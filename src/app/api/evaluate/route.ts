import { NextRequest, NextResponse } from "next/server";
import { ollamaGenerateJSON } from "@/lib/ollama/client";
import { buildEvaluatePrompt, parseEvaluateResponse } from "@/lib/prompts/evaluate";

export async function POST(req: NextRequest) {
  try {
    const { chunkContent, question, userAnswer, difficulty = 1 } = await req.json();

    if (!chunkContent || !question || !userAnswer) {
      return NextResponse.json({ error: "chunkContent, question, userAnswer are required" }, { status: 400 });
    }

    const raw = await ollamaGenerateJSON(buildEvaluatePrompt(chunkContent, question, userAnswer, difficulty));
    const result = parseEvaluateResponse(raw);

    return NextResponse.json(result);
  } catch (err) {
    console.error("[evaluate]", err);
    return NextResponse.json({ error: "평가 중 오류가 발생했습니다." }, { status: 500 });
  }
}
