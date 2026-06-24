import { EvaluationResult, QuestionResponse } from "@/shared/types";

export async function generateQuestions(chunkContent: string): Promise<QuestionResponse> {
  const res = await fetch("/api/question", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: chunkContent }),
  });

  if (!res.ok) throw new Error("질문 생성에 실패했습니다.");
  return res.json();
}

export async function evaluateAnswer(
  chunkContent: string,
  question: string,
  userAnswer: string,
  difficulty = 1
): Promise<EvaluationResult> {
  const res = await fetch("/api/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chunkContent, question, userAnswer, difficulty }),
  });

  if (!res.ok) throw new Error("평가에 실패했습니다.");
  return res.json();
}
