/**
 * Removes leading and trailing spaces and converts to lowercase.
 * @param {string} value - string to normalize
 * @returns {string | undefined} normalized string
 */
export function normalize(value?: string): string | undefined {
  return value?.trim().toLowerCase() ?? undefined;
}
