export function matchesListSearch(query: string, values: (string | undefined | null)[]) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  return values.some((value) => value?.toLowerCase().includes(normalized))
}
