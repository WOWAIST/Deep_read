import { NextRequest, NextResponse } from "next/server";
import { ollamaGenerateJSON } from "@/lib/ollama/client";
import { buildQuestionPrompt, parseQuestionResponse } from "@/lib/prompts/question";
import { QuestionResponse } from "@/shared/types";

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const raw = await ollamaGenerateJSON(buildQuestionPrompt(content));
    const questions = parseQuestionResponse(raw);

    const response: QuestionResponse = { questions };
    return NextResponse.json(response);
  } catch (err) {
    console.error("[question]", err);
    return NextResponse.json({ error: "질문 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}
