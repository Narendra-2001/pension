import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

import {
  clearSession,
  createSession,
  getSession,
  redirectToLogin,
  validateCredentials,
  type AuthSession,
} from '@/lib/auth'
import { validatePensionerCredentials } from '@/lib/pensioner-auth'
import type { AppUser } from '@/types/auth'

interface AuthContextValue {
  user: AppUser | null
  isAuthenticated: boolean
  login: (username: string, password: string, rememberMe: boolean) => Promise<AppUser | null>
  loginPensioner: (ppoNumber: string, password: string, rememberMe: boolean) => Promise<AppUser | null>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => getSession())

  const login = useCallback(async (username: string, password: string, rememberMe: boolean) => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    const user = validateCredentials(username, password)
    if (!user) return null
    const newSession = createSession(user, rememberMe)
    setSession(newSession)
    return user
  }, [])

  const loginPensioner = useCallback(async (ppoNumber: string, password: string, rememberMe: boolean) => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    const user = validatePensionerCredentials(ppoNumber, password)
    if (!user) return null
    const newSession = createSession(user, rememberMe)
    setSession(newSession)
    return user
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
    redirectToLogin()
  }, [])

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: session !== null,
      login,
      loginPensioner,
      logout,
    }),
    [session, login, loginPensioner, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
