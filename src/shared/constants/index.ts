export const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3";

export const CHUNK_MIN_WORDS = 50;
export const CHUNK_MAX_WORDS = 400;

export const DIFFICULTY_LEVELS = {
  1: "기술 용어 설명",
  2: "쉬운 예시 제공",
  3: "비유 제공",
  4: "초등학생 수준 설명",
} as const;
