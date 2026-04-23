import { createContext, useContext, useCallback, useEffect, useState, type ReactNode } from 'react'
import type {TelegramUser} from "../types/api.ts";
import {authService} from "../services";


type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  user: TelegramUser | null
  status: AuthStatus
  error: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (initData: string) => Promise<void>
  loginDev: (telegramId?: number) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  useEffect(() => {
    if (!authService.hasToken()) {
      setStatus('unauthenticated')
      return
    }

    setStatus('loading')
    authService.getMe()
      .then(data => {
        setUser(data)
        setStatus('authenticated')
      })
      .catch(() => logout())
  }, [logout])

  const login = useCallback(async (initData: string) => {
    setStatus('loading')
    setError(null)
    try {
      await authService.loginWithTelegram(initData)
      const userData = await authService.getMe()
      setUser(userData)
      setStatus('authenticated')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
      setStatus('unauthenticated')
      throw e
    }
  }, [])

  const loginDev = useCallback(async (telegramId = 1) => {
    setStatus('loading')
    setError(null)
    try {
      await authService.loginDev(telegramId)
      const userData = await authService.getMe()
      setUser(userData)
      setStatus('authenticated')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
      setStatus('unauthenticated')
      throw e
    }
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      status,
      error,
      isAuthenticated: status === 'authenticated',
      isLoading: status === 'loading',
      login,
      loginDev,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
