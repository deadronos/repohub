/**
 * Retrieves a string value from FormData, optionally trimming it.
 * @param formData The FormData object.
 * @param key The key to retrieve.
 * @param trim Whether to trim the string value. Defaults to true.
 * @returns The string value or empty string if not found or not a string.
 */
export function getFormString(formData: FormData, key: string, trim = true): string {
  const value = formData.get(key);
  if (typeof value !== 'string') {
    return '';
  }
  return trim ? value.trim() : value;
}
