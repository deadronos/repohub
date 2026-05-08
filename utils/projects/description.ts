/**
 * Strips a redundant title prefix from a description.
 *
 * If the description starts with the title (case-insensitive), removes the title
 * and any following colon, dash, or space separator.
 *
 * @example stripTitlePrefix("Idle Dungeon Crawler", "Idle Dungeon Crawler - A browser-based RPG")
 * // => "A browser-based RPG"
 * @example stripTitlePrefix("React App", "A standalone tool")
 * // => "A standalone tool" (no change)
 */
export function stripTitlePrefix(title: string, description: string | null | undefined): string {
  if (!description) return '';
  const trimmed = description.trim();
  if (!trimmed) return '';

  const lowerTitle = title.toLowerCase();
  const lowerDesc = trimmed.toLowerCase();

  if (!lowerDesc.startsWith(lowerTitle)) return trimmed;

  // Remove the title portion and any separator that follows
  const afterTitle = trimmed.slice(title.length);

  // Strip leading separator: colon, dash, em-dash, en-dash, or spaces
  const stripped = afterTitle.replace(/^[\s:;\-–—]+/, '');

  // If stripping leaves nothing meaningful, return the original description
  return stripped || trimmed;
}