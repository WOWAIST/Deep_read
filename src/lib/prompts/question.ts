import { LearningQuestion } from "@/shared/types";

export function buildQuestionPrompt(chunkContent: string): string {
  return `You are a Socratic technical coach. Your goal is to help Korean developers deeply understand English technical documentation — NOT to translate it.

Here is a technical document excerpt:
---
${chunkContent}
---

Generate 3 understanding-check questions in Korean. Questions must:
- Ask WHY, not just WHAT
- Connect concepts to real-world usage
- Encourage the learner to explain in their own words
- Never give away the answer

Return JSON array:
[{"question":"왜 이 구조가 필요한가요?","intent":"개념의 존재 이유를 파악","difficulty":1}]

difficulty: 1=easy, 2=medium, 3=hard`;
}

export function parseQuestionResponse(raw: unknown): LearningQuestion[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((q) => q && typeof q === "object" && "question" in q)
    .map((q) => ({
      question: String(q.question),
      intent: String(q.intent ?? ""),
      difficulty: Number(q.difficulty ?? 1),
    }));
}
