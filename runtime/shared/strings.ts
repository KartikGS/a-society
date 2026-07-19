/**
 * Coerce an unknown value into a clean list of strings: keep only strings,
 * trim them, drop empties, and de-duplicate (preserving first-seen order).
 * Lives in `shared/` so both the server and UI can use one implementation.
 */
export function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is string => typeof entry === 'string' && entry.trim() !== '')
    .map((entry) => entry.trim())
    .filter((entry, index, entries) => entries.indexOf(entry) === index);
}
