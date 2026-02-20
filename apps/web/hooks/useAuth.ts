/**
 * @file useAuth.ts
 * @description React hook for authentication operations and user state.
 *
 * Usage:
 * ```tsx
 * 'use client'
 *
 * import { useAuth } from '@/hooks/useAuth'
 *
 * export function ProfilePage() {
 *   const { user, session, loading, signOut } = useAuth()
 *
 *   if (loading) return <div>Loading...</div>
 *   if (!user) return <div>Please log in</div>
 *
 *   return (
 *     <div>
 *       <h1>Welcome, {user.email}</h1>
 *       <button onClick={signOut}>Sign Out</button>
 *     </div>
 *   )
 * }
 * ```
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User, Session } from '@supabase/supabase-js'
import { useSupabase } from './useSupabase'

interface UseAuthReturn {
  /** Current authenticated user (null if not logged in) */
  user: User | null
  /** Current session (null if not logged in) */
  session: Session | null
  /** Whether auth state is being loaded */
  loading: boolean
  /** Error message if auth operation failed */
  error: string | null
  /** Sign out the current user */
  signOut: () => Promise<void>
  /** Refresh the current session */
  refreshSession: () => Promise<void>
}

/**
 * Hook for managing authentication state and operations.
 * Automatically subscribes to auth state changes.
 *
 * @returns Authentication state and helper functions
 */
export function useAuth(): UseAuthReturn {
  const supabase = useSupabase()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          setError(sessionError.message)
          return
        }

        setSession(currentSession)
        setUser(currentSession?.user ?? null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get session')
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      setLoading(false)

      // Refresh the page on sign in/out to update server components
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  /**
   * Sign out the current user.
   */
  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)

      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) {
        setError(signOutError.message)
        throw signOutError
      }

      // Clear local state
      setUser(null)
      setSession(null)

      // Redirect to home page
      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign out')
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Manually refresh the current session.
   */
  const refreshSession = async () => {
    try {
      setLoading(true)
      setError(null)

      const {
        data: { session: refreshedSession },
        error: refreshError,
      } = await supabase.auth.refreshSession()

      if (refreshError) {
        setError(refreshError.message)
        throw refreshError
      }

      setSession(refreshedSession)
      setUser(refreshedSession?.user ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh session')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    session,
    loading,
    error,
    signOut,
    refreshSession,
  }
}

/**
 * Hook to check if user is authenticated.
 * Simpler alternative to useAuth when you only need to check auth status.
 *
 * @returns Object with isAuthenticated boolean and loading state
 */
export function useIsAuthenticated() {
  const { user, loading } = useAuth()
  return {
    isAuthenticated: !!user,
    loading,
  }
}

/**
 * Hook to require authentication and redirect if not logged in.
 * Useful for protecting client-side pages.
 *
 * @param redirectTo - Where to redirect unauthenticated users (default: '/login')
 * @returns User object if authenticated
 */
export function useRequireAuth(redirectTo: string = '/login') {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      const currentPath = window.location.pathname
      const redirectUrl = `${redirectTo}?redirectTo=${encodeURIComponent(currentPath)}`
      router.push(redirectUrl)
    }
  }, [user, loading, router, redirectTo])

  return { user, loading }
}
