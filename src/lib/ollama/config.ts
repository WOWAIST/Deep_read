// 서버 사이드 전용 — 클라이언트 컴포넌트에서 import 금지

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(
      `[TechDoc Coach] 환경변수 ${name}이 설정되지 않았습니다. .env.local을 확인하세요.`
    );
  }
  return value;
}

export const OLLAMA_BASE_URL = requireEnv("OLLAMA_BASE_URL", "http://localhost:11434");
export const OLLAMA_MODEL = requireEnv("OLLAMA_MODEL", "llama3");
