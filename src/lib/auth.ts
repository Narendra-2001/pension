import type { AppUser, UserRole } from '@/types/auth'
import { DEMO_PASSWORD } from '@/config/demo-roles'
import { validatePensionerCredentials } from '@/lib/pensioner-auth'

const AUTH_KEY = 'pension_session'
const REMEMBER_KEY = 'pension_remember'

/** @deprecated use DEMO_PASSWORD + ROLE_TILES */
export const DEMO_CREDENTIALS = {
  username: 'pensionadmin',
  password: DEMO_PASSWORD,
} as const

const DEMO_USERS: AppUser[] = [
  {
    username: 'superadmin',
    name: 'System Super Administrator',
    role: 'super_admin',
    department: 'Central IT & Governance',
  },
  {
    username: 'pensionadmin',
    name: 'Pension Administrator',
    role: 'pension_admin',
    department: 'Pension Authority',
  },
  {
    username: 'accounts',
    name: 'Kavitha Reddy',
    role: 'accounts',
    department: 'Finance Department',
  },
  {
    username: 'recovery',
    name: 'Rajesh Kumar',
    role: 'recovery',
    department: 'Recovery Cell',
  },
  {
    username: 'audit',
    name: 'Dr. Anil Mehta',
    role: 'audit',
    department: 'Audit Bureau',
  },
  {
    username: 'helpdesk',
    name: 'Priya Sharma',
    role: 'helpdesk',
    department: 'Citizen Support',
  },
]

export interface AuthSession {
  user: AppUser
  token: string
  expiresAt: number
}

export function rolePath(role: UserRole): string {
  const paths: Record<UserRole, string> = {
    super_admin: '/superadmin/dashboard',
    pension_admin: '/admin/dashboard',
    accounts: '/accounts/recovery/dashboard',
    recovery: '/recovery/dashboard',
    audit: '/audit/dashboard',
    helpdesk: '/helpdesk/dashboard',
    pensioner: '/pensioner/dashboard',
  }
  return paths[role]
}

export function roleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    super_admin: 'Super Admin',
    pension_admin: 'Pension Admin',
    accounts: 'Accounts Officer',
    recovery: 'Recovery Officer',
    audit: 'Audit Officer',
    helpdesk: 'Helpdesk',
    pensioner: 'Pensioner',
  }
  return labels[role]
}

export function validateCredentials(username: string, password: string): AppUser | null {
  const pensioner = validatePensionerCredentials(username, password)
  if (pensioner) return pensioner

  if (password !== DEMO_PASSWORD) return null
  const user = DEMO_USERS.find((u) => u.username.toLowerCase() === username.toLowerCase())
  return user ?? null
}

export function createSession(user: AppUser, rememberMe: boolean): AuthSession {
  const duration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000
  const session: AuthSession = {
    user,
    token: `token_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    expiresAt: Date.now() + duration,
  }
  localStorage.setItem(AUTH_KEY, JSON.stringify(session))
  if (rememberMe) {
    localStorage.setItem(REMEMBER_KEY, 'true')
  } else {
    localStorage.removeItem(REMEMBER_KEY)
  }
  return session
}

export function getSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as AuthSession
    if (session.expiresAt < Date.now()) {
      clearSession()
      return null
    }
    return session
  } catch {
    return null
  }
}

export function clearSession(): void {
  localStorage.removeItem(AUTH_KEY)
  localStorage.removeItem(REMEMBER_KEY)
}

export function redirectToLogin(): void {
  window.location.assign('/login')
}

export function isAuthenticated(): boolean {
  return getSession() !== null
}

export function hasRole(role: UserRole): boolean {
  return getSession()?.user.role === role
}
