import { NextRequest, NextResponse } from "next/server";
import { parseDocumentFromText } from "@/lib/parser";
import { chunkDocument } from "@/lib/chunker";
import { ollamaGenerateJSON } from "@/lib/ollama/client";
import { buildVocabularyPrompt, parseVocabularyResponse } from "@/lib/prompts/analyze";
import { AnalyzeResponse } from "@/shared/types";

export async function POST(req: NextRequest) {
  try {
    const { url, title, content } = await req.json();

    if (!content || typeof content !== "string") {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    const document = parseDocumentFromText(content, url ?? "", title ?? "");
    const chunks = chunkDocument(document.content);

    // Extract vocabulary from first chunk for quick response
    const firstChunkContent = chunks[0]?.content ?? content.slice(0, 500);
    const rawVocab = await ollamaGenerateJSON(buildVocabularyPrompt(firstChunkContent));
    const vocabulary = parseVocabularyResponse(rawVocab);

    const response: AnalyzeResponse = { chunks, vocabulary };
    return NextResponse.json(response);
  } catch (err) {
    console.error("[analyze]", err);
    return NextResponse.json({ error: "분석 중 오류가 발생했습니다." }, { status: 500 });
  }
}
