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

/**
 * Sanitizes a filename by replacing unsafe characters with underscores.
 * Allows alphanumeric characters, dots, underscores, and hyphens.
 * @param filename The filename to sanitize.
 * @returns The sanitized filename.
 */
export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}
