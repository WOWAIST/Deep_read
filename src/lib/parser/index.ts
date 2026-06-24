import { Document } from "@/shared/types";

export function parseDocumentFromHTML(html: string, url: string, title: string): Document {
  const withoutScript = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  const withoutStyle = withoutScript.replace(/<style[\s\S]*?<\/style>/gi, "");
  const text = withoutStyle
    .replace(/<\/?(h[1-6]|p|li|div|section|article|header|footer|nav|aside)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { url, title, content: text };
}

export function parseDocumentFromText(text: string, url: string, title: string): Document {
  return { url, title, content: text.trim() };
}
