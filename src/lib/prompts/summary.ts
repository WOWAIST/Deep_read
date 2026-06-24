import { SummaryResponse } from "@/shared/types";

export function buildSummaryPrompt(chunks: string[]): string {
  const combined = chunks.map((c, i) => `[Chunk ${i + 1}]\n${c}`).join("\n\n");
  return `You are a technical documentation coach summarizing a completed learning session.

The user just studied the following English technical document sections:
---
${combined}
---

Create a final learning summary in Korean. Return JSON:
{
  "keyConcepts": ["핵심 개념 1", "핵심 개념 2", "핵심 개념 3"],
  "mustKnowTerms": [{"term":"term","meaning":"설명","practicalExample":"예시"}],
  "practicalScenarios": ["실무에서 만날 상황 1", "실무에서 만날 상황 2"],
  "recommendedDocs": ["다음에 읽으면 좋은 문서 제목 1", "다음에 읽으면 좋은 문서 제목 2"]
}

Keep it concise and actionable. Focus on what the user can apply in their real projects.`;
}

export function parseSummaryResponse(raw: unknown): SummaryResponse {
  if (typeof raw !== "object" || raw === null) {
    return { keyConcepts: [], mustKnowTerms: [], practicalScenarios: [], recommendedDocs: [] };
  }
  const r = raw as Record<string, unknown>;
  return {
    keyConcepts: Array.isArray(r.keyConcepts) ? r.keyConcepts.map(String) : [],
    mustKnowTerms: Array.isArray(r.mustKnowTerms) ? r.mustKnowTerms : [],
    practicalScenarios: Array.isArray(r.practicalScenarios) ? r.practicalScenarios.map(String) : [],
    recommendedDocs: Array.isArray(r.recommendedDocs) ? r.recommendedDocs.map(String) : [],
  };
}
