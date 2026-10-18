import "server-only";

/** Response for private media: never cached by shared caches, never sniffed, never framed elsewhere. */
export function privateFile(data: Buffer, mime: string, extra: Record<string, string> = {}) {
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": mime,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      "Cross-Origin-Resource-Policy": "same-origin",
      ...extra,
    },
  });
}
