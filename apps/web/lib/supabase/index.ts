/**
 * @file index.ts
 * @description Barrel export for all Supabase utilities.
 *
 * Usage:
 * ```ts
 * // Client-side
 * import { getSupabaseClient } from '@/lib/supabase'
 *
 * // Server-side
 * import { createServerClient, getAdminClient } from '@/lib/supabase'
 *
 * // Error handling
 * import { handleSupabaseQuery, SupabaseError } from '@/lib/supabase'
 * ```
 */

// Client (browser)
export {
  createBrowserClient,
  getSupabaseClient,
  resetClientInstance,
} from './client'

// Server (API routes, Server Components)
export {
  createServerClient,
  createAdminClient,
  getAdminClient,
  resetAdminClientInstance,
  getCurrentUser,
  getCurrentSession,
} from './server'

// Middleware
export {
  createMiddlewareClient,
  requireAuth,
  redirectIfAuthenticated,
} from './middleware'

// Error handling
export {
  SupabaseError,
  getErrorMessage,
  isPostgrestError,
  handleSupabaseQuery,
  handleSupabaseMutation,
  logSupabaseError,
  isNotFoundError,
  isPermissionError,
  isDuplicateError,
} from './errors'
