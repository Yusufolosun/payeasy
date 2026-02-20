/**
 * @file server.ts
 * @description Server-side Supabase clients for API routes and Server Components.
 *              Provides both service role (admin) and user-scoped clients.
 *
 * Usage (Server Components / API Routes):
 * ```ts
 * import { getAdminClient, createServerClient } from '@/lib/supabase/server'
 *
 * // For admin operations (bypasses RLS)
 * const admin = getAdminClient()
 * await admin.from('users').update({ ... })
 *
 * // For user-scoped operations (respects RLS, uses cookies)
 * const supabase = await createServerClient()
 * await supabase.from('listings').select()
 * ```
 */

import { createServerClient as createSSRServerClient } from '@supabase/ssr'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/types/database'

// ──────────────────────────────────────────────────────────────
// Service Role (Admin) Client — Bypasses RLS
// ──────────────────────────────────────────────────────────────

let adminClientInstance: SupabaseClient<Database> | null = null

/**
 * Creates a Supabase admin client with service role key.
 * ⚠️  BYPASSES ALL ROW LEVEL SECURITY — use with extreme caution.
 *
 * @returns Admin Supabase client
 * @throws Error if environment variables are missing
 */
export function createAdminClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      '❌ Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    )
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'payeasy-admin@1.0.0',
      },
    },
    db: {
      schema: 'public',
    },
  })
}

/**
 * Get or create a singleton admin client instance.
 * Reuses the same connection to avoid creating multiple admin clients.
 *
 * ⚠️  BYPASSES ALL ROW LEVEL SECURITY — use only for:
 * - System operations
 * - Batch jobs
 * - Admin endpoints with proper authorization checks
 *
 * @returns Singleton admin Supabase client
 */
export function getAdminClient(): SupabaseClient<Database> {
  if (!adminClientInstance) {
    adminClientInstance = createAdminClient()
  }
  return adminClientInstance
}

/**
 * Reset the admin client singleton (useful for testing).
 */
export function resetAdminClientInstance(): void {
  adminClientInstance = null
}

// ──────────────────────────────────────────────────────────────
// Server Client — Respects RLS, Uses Cookies for Auth
// ──────────────────────────────────────────────────────────────

/**
 * Creates a server-side Supabase client that respects RLS and reads
 * authentication from Next.js cookies (for App Router).
 *
 * This client is tied to the current user's session and should be used
 * for user-scoped operations in Server Components and Route Handlers.
 *
 * @returns Promise resolving to user-scoped Supabase client
 * @throws Error if environment variables are missing
 */
export async function createServerClient(): Promise<SupabaseClient<Database>> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      '❌ Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  const cookieStore = await cookies()

  return createSSRServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch (error) {
          // Cookie setting can fail in Server Components during render
          // This is expected and can be safely ignored
        }
      },
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false, // Not needed on server
      flowType: 'pkce',
    },
    global: {
      headers: {
        'X-Client-Info': 'payeasy-server@1.0.0',
      },
    },
  })
}

// ──────────────────────────────────────────────────────────────
// Helper Functions
// ──────────────────────────────────────────────────────────────

/**
 * Get the current authenticated user from server-side context.
 *
 * @returns User object if authenticated, null otherwise
 */
export async function getCurrentUser() {
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

/**
 * Get the current session from server-side context.
 *
 * @returns Session object if authenticated, null otherwise
 */
export async function getCurrentSession() {
  const supabase = await createServerClient()
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error || !session) {
    return null
  }

  return session
}
