/**
 * @file client.ts
 * @description Client-side Supabase client for browser usage.
 *              Uses the anon key and respects Row Level Security (RLS).
 *              Singleton pattern ensures only one client instance.
 *
 * Usage (Client Components):
 * ```tsx
 * import { getSupabaseClient } from '@/lib/supabase/client'
 *
 * const supabase = getSupabaseClient()
 * const { data } = await supabase.from('listings').select()
 * ```
 */

import { createBrowserClient as createSSRBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

let clientInstance: SupabaseClient<Database> | null = null

/**
 * Creates a typed Supabase client for browser/client-side usage.
 * Uses @supabase/ssr for better Next.js App Router integration.
 *
 * @returns Typed Supabase client instance
 * @throws Error if environment variables are missing
 */
export function createBrowserClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      '❌ Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  return createSSRBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce', // Use PKCE flow for better security
    },
    global: {
      headers: {
        'X-Client-Info': 'payeasy-web@1.0.0',
      },
    },
  })
}

/**
 * Get or create a singleton Supabase client instance for browser usage.
 * Recommended for most client-side operations to avoid creating multiple instances.
 *
 * @returns Singleton Supabase client instance
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (!clientInstance) {
    clientInstance = createBrowserClient()
  }
  return clientInstance
}

/**
 * Reset the singleton client instance (useful for testing or auth changes).
 */
export function resetClientInstance(): void {
  clientInstance = null
}
