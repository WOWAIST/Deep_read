import { AnalyzeResponse } from "@/shared/types";

export async function analyzeDocument(
  content: string,
  url = "",
  title = ""
): Promise<AnalyzeResponse> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, url, title }),
  });

  if (!res.ok) throw new Error("문서 분석에 실패했습니다.");
  return res.json();
}
