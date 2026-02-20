/**
 * @file db/types.ts
 * @description Re-exports from the canonical type definitions in `@/lib/types`.
 *
 * All database model types now live in `@/lib/types/database.ts`.
 * API request/response types live in `@/lib/types/api.ts`.
 *
 * This file re-exports those types so that existing imports from
 * `@/lib/db/types` continue to work without modification.
 *
 * Prefer importing directly from `@/lib/types` in new code.
 */

export type {
  // Database models
  Listing,
  ListingRow,
  ListingInsert,
  ListingUpdate,
  ListingAmenity,
  ListingAmenityRow,
  ListingAmenityInsert,
  ListingWithLandlord,
  ListingWithAmenities,
  ListingDetail,
  ListingStatus,
} from '@/lib/types/database'

export type {
  // Search / API types
  ListingSearchParams,
  ListingSearchResult,
} from '@/lib/types/api'
