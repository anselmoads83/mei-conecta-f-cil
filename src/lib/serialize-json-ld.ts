// JSON-LD is data, not executable JavaScript. Escape '<' to prevent an HTML
// parser from recognizing a closing script tag, including case variations.
export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
