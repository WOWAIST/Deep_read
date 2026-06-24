import { EvaluationResult } from "@/shared/types";

export function buildEvaluatePrompt(
  chunkContent: string,
  question: string,
  userAnswer: string,
  difficulty: number
): string {
  return `You are a strict but kind technical documentation coach.

Original document excerpt:
---
${chunkContent}
---

Question asked (in Korean): ${question}
User's answer (in Korean): ${userAnswer}
Current difficulty level: ${difficulty}/4

Evaluate the user's understanding. Return JSON:
{
  "understood": true/false,
  "level": "correct" | "partial" | "incorrect",
  "feedback": "Korean feedback explaining what was right/wrong and why (2-3 sentences)",
  "nextQuestion": "follow-up question in Korean if partial/incorrect, null if correct"
}

Rules:
- "correct": user clearly understands the concept and can explain it
- "partial": user has some understanding but missing key points
- "incorrect": user misunderstood or cannot explain
- Feedback must reference the original document, not translate it
- If incorrect, hint at the right direction without giving the answer`;
}

export function parseEvaluateResponse(raw: unknown): EvaluationResult {
  if (typeof raw !== "object" || raw === null) {
    return { understood: false, level: "incorrect", feedback: "평가 중 오류가 발생했습니다." };
  }
  const r = raw as Record<string, unknown>;
  return {
    understood: Boolean(r.understood),
    level: (r.level as EvaluationResult["level"]) ?? "incorrect",
    feedback: String(r.feedback ?? ""),
    nextQuestion: r.nextQuestion ? String(r.nextQuestion) : undefined,
  };
}
