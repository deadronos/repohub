/**
 * Truncates a string to a specified length and appends an ellipsis if truncated.
 * @param text The string to truncate.
 * @param length The maximum length of the string including the ellipsis.
 * @returns The truncated string.
 */
export function truncate(text: string, length: number): string {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.slice(0, length - 3) + '...';
}

/**
 * Capitalizes the first letter of a string.
 * @param text The string to capitalize.
 * @returns The capitalized string.
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}
