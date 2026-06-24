import { Vocabulary } from "@/shared/types";
import { ollamaGenerateJSON } from "@/lib/ollama/client";
import { buildVocabularyPrompt, parseVocabularyResponse } from "@/lib/prompts/analyze";

export async function extractVocabulary(chunkContent: string): Promise<Vocabulary[]> {
  const raw = await ollamaGenerateJSON(buildVocabularyPrompt(chunkContent));
  return parseVocabularyResponse(raw);
}
