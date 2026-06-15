const PREFILL_KEY = 'prefill_login_role'

export function prefillLoginRole(role: string) {
  sessionStorage.setItem(PREFILL_KEY, role)
}

export function consumePrefillLoginRole(): string | null {
  const value = sessionStorage.getItem(PREFILL_KEY)
  if (value) sessionStorage.removeItem(PREFILL_KEY)
  return value
}
