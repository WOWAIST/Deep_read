import { Vocabulary } from "@/shared/types";

export function buildVocabularyPrompt(chunkContent: string): string {
  return `You are a technical documentation coach helping Korean developers learn English tech docs.

Analyze this English technical document excerpt and extract key technical terms:

---
${chunkContent}
---

Return a JSON array of vocabulary objects. Each object must have:
- "term": the exact technical term from the text (in English)
- "meaning": a concise explanation in Korean (1-2 sentences)
- "practicalExample": a real-world practical usage example in Korean

Extract 3-6 of the most important technical terms. Focus on terms that are hard for Korean junior developers.

Example format:
[{"term":"middleware","meaning":"요청과 응답 사이에서 실행되는 함수","practicalExample":"Express에서 인증 검사나 로깅을 미들웨어로 구현한다"}]`;
}

export function parseVocabularyResponse(raw: unknown): Vocabulary[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((v) => v && typeof v === "object" && "term" in v && "meaning" in v)
    .map((v) => ({
      term: String(v.term),
      meaning: String(v.meaning),
      practicalExample: String(v.practicalExample ?? ""),
    }));
}
