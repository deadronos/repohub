export function safeParseUrl(url: string): URL | null {
  if (!url) {
    return null;
  }
  try {
    return new URL(url);
  } catch {
    return null;
  }
}
