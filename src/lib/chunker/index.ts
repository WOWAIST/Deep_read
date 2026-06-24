import { DocumentChunk } from "@/shared/types";
import { generateId, countWords } from "@/shared/utils";
import { CHUNK_MIN_WORDS, CHUNK_MAX_WORDS } from "@/shared/constants";

interface RawChunk {
  heading?: string;
  lines: string[];
}

export function chunkDocument(content: string): DocumentChunk[] {
  const lines = content.split("\n");
  const raw: RawChunk[] = [];
  let current: RawChunk = { lines: [] };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Heading detection: lines that are short, uppercase-heavy, or markdown-style
    const isHeading =
      /^#{1,6}\s/.test(trimmed) ||
      (trimmed.length < 80 && /^[A-Z][^.!?]*$/.test(trimmed));

    if (isHeading && current.lines.length > 0) {
      raw.push(current);
      current = { heading: trimmed.replace(/^#+\s*/, ""), lines: [] };
    } else if (isHeading) {
      current.heading = trimmed.replace(/^#+\s*/, "");
    } else {
      current.lines.push(trimmed);
    }
  }

  if (current.lines.length > 0) raw.push(current);

  // Merge small chunks, split large ones
  const merged: RawChunk[] = [];
  let buffer: RawChunk = { lines: [] };

  for (const chunk of raw) {
    const words = countWords(chunk.lines.join(" "));
    if (words < CHUNK_MIN_WORDS && !chunk.heading) {
      buffer.lines.push(...chunk.lines);
    } else {
      if (buffer.lines.length > 0) {
        merged.push(buffer);
        buffer = { lines: [] };
      }
      merged.push(chunk);
    }
  }
  if (buffer.lines.length > 0) merged.push(buffer);

  const result: DocumentChunk[] = [];
  let order = 0;

  for (const chunk of merged) {
    const text = chunk.lines.join("\n");
    const words = countWords(text);

    if (words > CHUNK_MAX_WORDS) {
      // Split into sub-chunks by sentence
      const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
      let sub: string[] = [];
      let subWords = 0;

      for (const sentence of sentences) {
        const sw = countWords(sentence);
        if (subWords + sw > CHUNK_MAX_WORDS && sub.length > 0) {
          result.push({ id: generateId(), order: order++, content: sub.join(" "), heading: chunk.heading });
          sub = [];
          subWords = 0;
        }
        sub.push(sentence.trim());
        subWords += sw;
      }
      if (sub.length > 0) {
        result.push({ id: generateId(), order: order++, content: sub.join(" "), heading: chunk.heading });
      }
    } else {
      result.push({ id: generateId(), order: order++, content: text, heading: chunk.heading });
    }
  }

  return result.filter((c) => countWords(c.content) >= 20);
}
