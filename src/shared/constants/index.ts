// 클라이언트에 노출해도 안전한 상수만 여기에 작성

export const CHUNK_MIN_WORDS = 50;
export const CHUNK_MAX_WORDS = 400;

export const DIFFICULTY_LEVELS = {
  1: "기술 용어 설명",
  2: "쉬운 예시 제공",
  3: "비유 제공",
  4: "초등학생 수준 설명",
} as const;
