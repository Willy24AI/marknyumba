/** Supabase nested foreign keys may return an object or a single-element array. */
export function unwrapOne<T>(row: T | T[] | null | undefined): T | null {
  if (row == null) return null;
  if (Array.isArray(row)) return row[0] ?? null;
  return row;
}
