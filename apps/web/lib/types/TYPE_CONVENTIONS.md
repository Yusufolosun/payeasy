# PayEasy Type Conventions

This document describes the type system architecture and naming conventions used throughout the PayEasy application to ensure type safety and consistency.

## 📁 File Organization

```
lib/types/
├── database.ts      # Core database model types
├── validation.ts    # Zod schemas for runtime validation
├── api.ts          # API request/response types
├── index.ts        # Barrel exports
└── TYPE_CONVENTIONS.md  # This file
```

## 🏗️ Type Naming Conventions

### Database Types

#### `*Row` — Exact Database Row Types
Represents the exact 1:1 mapping of a PostgreSQL row with explicit nulls.

```typescript
export interface UserRow {
  id: string
  public_key: StellarPublicKey
  username: string
  email: string | null          // ← explicit null
  avatar_url: string | null     // ← explicit null
  created_at: ISOTimestamp
  updated_at: ISOTimestamp
}
```

**When to use:** 
- Direct database queries
- Supabase client type parameters
- When you need to handle nulls explicitly

---

#### Plain Interface (e.g., `User`) — Domain Layer Types
Domain-layer types with optional fields instead of nulls for easier consumption.

```typescript
export interface User {
  id: string
  public_key: StellarPublicKey
  username: string
  email?: string           // ← optional, not null
  avatar_url?: string      // ← optional, not null
  created_at: ISOTimestamp
  updated_at: ISOTimestamp
}
```

**When to use:**
- Application logic
- Component props
- After fetching and null-checking database rows

**Conversion pattern:**
```typescript
// Row → Domain type
const userRow: UserRow = await db.from('users').select().single()
const user: User = {
  ...userRow,
  email: userRow.email ?? undefined,
  avatar_url: userRow.avatar_url ?? undefined,
}
```

---

#### `*Insert` — Insert Operation Types
Fields required/allowed when creating a new database record.

```typescript
export type UserInsert = Omit<UserRow, 'created_at' | 'updated_at'> & {
  id?: string  // Auto-generated if not provided
}
```

**When to use:**
- POST API handlers
- Creating new records
- Type safety for insert operations

---

#### `*Update` — Update Operation Types
Partial type for PATCH/update operations. Only mutable fields are included.

```typescript
// Public key is immutable after creation
export type UserUpdate = Partial<Omit<UserInsert, 'id' | 'public_key'>>
```

**When to use:**
- PATCH API handlers
- Updating existing records
- All fields are optional

---

### API Response Types

#### `Public*` — Public-Safe Projections
Removes sensitive fields safe for exposing to other users.

```typescript
// Never exposes email or bio to other users
export type PublicUser = Pick<User, 'id' | 'username' | 'avatar_url'>
```

**When to use:**
- API responses showing other users
- Public profiles
- Listing landlord information

---

#### `*Response` — API Response Shapes
Structured responses returned by API endpoints.

```typescript
export interface ListingDetailResponse {
  listing: Listing
  landlord: PublicUser
  amenities: string[]
  is_favorited: boolean
}
```

**When to use:**
- API route return types
- Client-side API expectations
- Documentation

---

#### `*Body` — API Request Bodies
Types for request payloads sent to API endpoints.

```typescript
export type CreateListingBody = Omit<
  Listing,
  'id' | 'landlord_id' | 'status' | 'created_at' | 'updated_at'
>
```

**When to use:**
- Request body validation
- Client-side request typing
- API documentation

---

### Validation Types

#### `*Schema` — Zod Runtime Validators
Zod schemas that validate data at runtime.

```typescript
export const userInsertSchema = z.object({
  public_key: stellarPublicKeySchema,
  username: z.string().min(3).max(30),
  email: z.string().email().optional().nullable(),
})
```

**When to use:**
- API route validation
- Form validation
- Any runtime data validation

---

#### `*Input` — z.infer Derived Types
TypeScript types inferred from Zod schemas (single source of truth).

```typescript
export type UserInsertInput = z.infer<typeof userInsertSchema>
```

**Benefits:**
- Types automatically match validation rules
- No duplication between runtime and compile-time types
- Changes to schema automatically update types

**When to use:**
- Form submission handlers
- After successful validation
- Type-safe validated data

---

### Enriched/Joined Types

#### `*With*` — Types with Relations
Represents a type joined with related entities.

```typescript
export interface ListingWithLandlord extends Listing {
  landlord: PublicUser
}

export interface ConversationWithUsers extends Conversation {
  user1: PublicUser
  user2: PublicUser
  listing?: Pick<Listing, 'id' | 'title'>
}
```

**When to use:**
- After JOIN queries
- Detail views
- When you need related data

---

#### `*Detail` — Full Detail Views
Complete representation with all relations for detail pages.

```typescript
export interface RentAgreementDetail extends RentAgreement {
  listing: ListingWithAmenities
  landlord: PublicUser
  tenants: PublicUser[]
}
```

**When to use:**
- Detail/show pages
- Full entity representation
- When you need everything

---

### Branded Types

Branded types add semantic meaning and prevent mixing incompatible strings.

```typescript
export type StellarPublicKey = string & { readonly __brand: 'StellarPublicKey' }
export type ContractId = string & { readonly __brand: 'ContractId' }
export type ISOTimestamp = string & { readonly __brand: 'ISOTimestamp' }
```

**Benefits:**
```typescript
function sendPayment(to: StellarPublicKey) { /* ... */ }

const userId: string = "123e4567-e89b-12d3-a456-426614174000"
const pubKey: StellarPublicKey = "GBFX..." as StellarPublicKey

sendPayment(userId)  // ❌ Type error: string is not StellarPublicKey
sendPayment(pubKey)  // ✅ Correct
```

---

### Enum Types

Use TypeScript literal unions for database enums.

```typescript
export type ListingStatus = 'active' | 'inactive' | 'deleted'
export type PaymentStatus = 'pending' | 'confirmed' | 'failed'
export type AgreementStatus = 'draft' | 'active' | 'completed' | 'cancelled'
export type MessageType = 'text' | 'image' | 'payment_request' | 'agreement_invite'
```

**Benefits:**
- Type-safe discriminated unions
- Autocomplete in IDEs
- Compile-time validation

---

## 🔄 Common Patterns

### Pattern 1: Zod + TypeScript Shared Validation

Use `z.infer<>` to derive types from Zod schemas for DRY principle.

```typescript
// validation.ts
export const listingInsertSchema = z.object({
  title: z.string().min(5).max(100),
  rent_xlm: z.number().positive(),
  // ...
})

export type ListingInsertInput = z.infer<typeof listingInsertSchema>

// API route
import { listingInsertSchema, type ListingInsertInput } from '@/lib/types'

export async function POST(req: Request) {
  const result = listingInsertSchema.safeParse(await req.json())
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  
  const data: ListingInsertInput = result.data  // ✅ Fully typed
  // ...
}
```

---

### Pattern 2: Partial for Updates

Use `Partial<>` for update operations where all fields are optional.

```typescript
export type UserUpdate = Partial<Omit<UserInsert, 'id' | 'public_key'>>

// Usage
const updates: UserUpdate = {
  username: "new_username"  // Only updating username
}
```

---

### Pattern 3: Pick for Restricted Fields

Use `Pick<>` to create minimal types for specific use cases.

```typescript
// Card view doesn't need full description
export type ListingCardResponse = Pick<
  Listing,
  'id' | 'title' | 'address' | 'rent_xlm' | 'bedrooms' | 'bathrooms'
> & {
  landlord: PublicUser
}
```

---

### Pattern 4: Omit for Creation Types

Use `Omit<>` to exclude auto-generated fields from creation types.

```typescript
export type CreateListingBody = Omit<
  Listing,
  'id' | 'landlord_id' | 'status' | 'created_at' | 'updated_at'
>
```

---

## 📊 Database Interface

The `Database` interface provides full type safety for Supabase client operations.

```typescript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserRow
        Insert: UserInsert
        Update: UserUpdate
      }
      listings: {
        Row: ListingRow
        Insert: ListingInsert
        Update: ListingUpdate
      }
      // ... all other tables
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      listing_status: ListingStatus
      payment_status: PaymentStatus
      agreement_status: AgreementStatus
      message_type: MessageType
    }
  }
}
```

**Usage:**
```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

const supabase = createClient<Database>(url, key)

// Now all queries are fully typed!
const { data } = await supabase
  .from('listings')           // ✅ Autocomplete for table names
  .select()                   // ✅ data is ListingRow[]
  .eq('status', 'active')     // ✅ Autocomplete for columns and values
```

---

## 🎯 Best Practices

### ✅ DO

1. **Use domain types in application code**
   ```typescript
   function displayUser(user: User) { /* ... */ }  // ✅
   ```

2. **Use Row types for database operations**
   ```typescript
   const row: UserRow = await supabase.from('users').select().single()  // ✅
   ```

3. **Use Zod schemas for validation**
   ```typescript
   const result = listingInsertSchema.safeParse(req.body)  // ✅
   ```

4. **Keep types co-located when feature-specific**
   ```typescript
   // features/checkout/types.ts
   export interface CheckoutSession { /* ... */ }
   ```

5. **Document complex types**
   ```typescript
   /**
    * Represents a user's favorited listing with full details.
    * Joins user_favorites → listings → users
    */
   export interface UserFavoriteWithListing { /* ... */ }
   ```

### ❌ DON'T

1. **Don't mix Row and domain types**
   ```typescript
   function displayUser(user: UserRow) { /* ❌ Use User instead */ }
   ```

2. **Don't duplicate validation logic**
   ```typescript
   // ❌ Bad: Separate type and validation
   type UserInput = { email: string }
   if (!/\S+@\S+/.test(input.email)) { /* ... */ }
   
   // ✅ Good: Use Zod schema
   const schema = z.object({ email: z.string().email() })
   ```

3. **Don't use `any` or type assertions unless necessary**
   ```typescript
   const user = data as User  // ❌ Avoid if possible
   ```

4. **Don't expose sensitive fields in public APIs**
   ```typescript
   // ❌ Bad: Exposes email
   return NextResponse.json({ user })
   
   // ✅ Good: Use PublicUser
   return NextResponse.json({ user: toPublicUser(user) })
   ```

---

## 📚 Reference

- [TypeScript Handbook - Types from Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- [Zod Documentation](https://zod.dev)
- [Supabase TypeScript Support](https://supabase.com/docs/guides/api/typescript-support)

---

## 🔄 Migration Checklist

When adding a new database table:

- [ ] Add `*Row` interface in `database.ts`
- [ ] Add domain interface (removes nulls)
- [ ] Add `*Insert` type
- [ ] Add `*Update` type
- [ ] Add projection types (`With*`, `*Detail`, etc.)
- [ ] Update `Database` interface
- [ ] Add Zod schemas in `validation.ts`
- [ ] Add `*Input` types from schemas
- [ ] Add API response types in `api.ts`
- [ ] Export all new types in `index.ts`
- [ ] Update this documentation if needed

---

**Last Updated:** February 20, 2026  
**Maintainers:** PayEasy Development Team
