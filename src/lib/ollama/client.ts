import { OLLAMA_BASE_URL, OLLAMA_MODEL } from "./config";

interface OllamaResponse {
  response: string;
}

export async function ollamaGenerate(prompt: string, model = OLLAMA_MODEL): Promise<string> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, stream: false }),
  });

  if (!res.ok) {
    throw new Error(`Ollama error: ${res.status} ${res.statusText}`);
  }

  const data: OllamaResponse = await res.json();
  return data.response.trim();
}

export async function ollamaGenerateJSON<T>(prompt: string, model = OLLAMA_MODEL): Promise<T> {
  const jsonPrompt = `${prompt}\n\nRespond with valid JSON only. No explanation, no markdown, no code blocks.`;
  const raw = await ollamaGenerate(jsonPrompt, model);

  const match = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!match) throw new Error("No JSON found in Ollama response");

  return JSON.parse(match[0]) as T;
}
