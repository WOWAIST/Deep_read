export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
