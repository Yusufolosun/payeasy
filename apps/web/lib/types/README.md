# PayEasy Type System

Complete TypeScript type definitions for all database models and API operations.

## 📁 Files

| File | Purpose |
|------|---------|
| [`database.ts`](./database.ts) | Core database model types for all tables |
| [`validation.ts`](./validation.ts) | Zod schemas for runtime validation |
| [`api.ts`](./api.ts) | API request/response helper types |
| [`index.ts`](./index.ts) | Barrel exports - import from here |
| [`TYPE_CONVENTIONS.md`](./TYPE_CONVENTIONS.md) | **📖 Full documentation & conventions** |

## 🚀 Quick Start

### Import Types

```typescript
// Import from the barrel export
import type { 
  User, 
  Listing, 
  ConversationWithUsers,
  ApiResponse 
} from '@/lib/types'

// Import validation schemas
import { 
  listingInsertSchema,
  userUpdateSchema 
} from '@/lib/types'
```

### Use with Supabase

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

const supabase = createClient<Database>(url, key)

// All operations are now fully typed ✅
const { data } = await supabase
  .from('listings')
  .select('*, landlord:users(*)')
  .eq('status', 'active')
```

### Validate API Requests

```typescript
import { listingInsertSchema } from '@/lib/types'

export async function POST(req: Request) {
  const result = listingInsertSchema.safeParse(await req.json())
  
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten() }, 
      { status: 400 }
    )
  }
  
  // result.data is fully typed as ListingInsertInput ✅
  const listing = await createListing(result.data)
  return NextResponse.json({ data: listing })
}
```

## 📊 Available Types

### Database Models

- ✅ **User** - User accounts with Stellar wallet integration
- ✅ **Listing** - Rental property listings
- ✅ **Conversation** - User-to-user conversations (optionally listing-scoped)
- ✅ **ConversationMessage** - Individual messages in conversations
- ✅ **PaymentRecord** - Stellar blockchain payment tracking
- ✅ **RentAgreement** - Soroban smart contract rent agreements
- ✅ **UserFavorite** - User's bookmarked listings

### Helper Types

For each model, you get:

- `*Row` - Exact database row (nulls explicit)
- Plain interface - Domain type (nulls → optional)
- `*Insert` - For creating new records
- `*Update` - For updating existing records
- `*With*` - Joined with related entities
- `Public*` - Safe for public API responses

### API Types

- `ApiResponse<T>` - Standard success/error envelope
- `PaginatedResponse<T>` - Paginated list responses
- Specific request/response types for each endpoint

### Validation

- Zod schemas for all models
- `z.infer<>` derived input types
- Shared runtime + compile-time validation

## 🎯 Type Naming Conventions

| Pattern | Example | Use Case |
|---------|---------|----------|
| `*Row` | `UserRow` | Direct database queries |
| Plain | `User` | Application logic, components |
| `*Insert` | `UserInsert` | Creating new records |
| `*Update` | `UserUpdate` | Updating records (PATCH) |
| `Public*` | `PublicUser` | Safe public API responses |
| `*Response` | `ListingDetailResponse` | API response shapes |
| `*Body` | `CreateListingBody` | API request bodies |
| `*Schema` | `userInsertSchema` | Zod runtime validators |
| `*Input` | `UserInsertInput` | `z.infer<>` derived types |
| `*With*` | `ListingWithLandlord` | Joined with relations |
| `*Detail` | `RentAgreementDetail` | Full detail view |

## 📖 Full Documentation

👉 **See [TYPE_CONVENTIONS.md](./TYPE_CONVENTIONS.md) for:**
- Complete naming convention guide
- Common patterns and examples
- Best practices
- Migration checklist
- Do's and don'ts

## 🔐 Branded Types

Semantic type safety for strings:

```typescript
type StellarPublicKey = string & { readonly __brand: 'StellarPublicKey' }
type ContractId = string & { readonly __brand: 'ContractId' }
type ISOTimestamp = string & { readonly __brand: 'ISOTimestamp' }
```

Prevents mixing incompatible string values at compile-time.

## 🛠️ Status Enums

```typescript
type ListingStatus = 'active' | 'inactive' | 'deleted'
type PaymentStatus = 'pending' | 'confirmed' | 'failed'
type AgreementStatus = 'draft' | 'active' | 'completed' | 'cancelled'
type MessageType = 'text' | 'image' | 'payment_request' | 'agreement_invite'
```

## 📝 Examples

### Example 1: Create a Listing

```typescript
import { listingInsertSchema, type ListingInsertInput } from '@/lib/types'

const data: ListingInsertInput = {
  landlord_id: user.id,
  title: "Cozy 2BR Apartment",
  description: "Beautiful apartment in downtown",
  address: "123 Main St",
  rent_xlm: 1000,
  bedrooms: 2,
  bathrooms: 1.5,
  status: 'active'
}

// Validate before inserting
const result = listingInsertSchema.safeParse(data)
if (result.success) {
  await supabase.from('listings').insert(result.data)
}
```

### Example 2: Fetch with Relations

```typescript
import type { ListingWithLandlord, Database } from '@/lib/types'

const supabase = createClient<Database>(url, key)

const { data } = await supabase
  .from('listings')
  .select(`
    *,
    landlord:users(id, username, avatar_url)
  `)
  .eq('id', listingId)
  .single()

// data is typed as ListingRow with nested user data
const listing: ListingWithLandlord = transformToListingWithLandlord(data)
```

### Example 3: API Response

```typescript
import type { ApiResponse, ListingDetailResponse } from '@/lib/types'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  const listing = await fetchListingDetail(params.id)
  
  if (!listing) {
    const error: ApiResponse<never> = {
      data: null,
      error: {
        message: 'Listing not found',
        code: 'LISTING_NOT_FOUND'
      }
    }
    return NextResponse.json(error, { status: 404 })
  }
  
  const success: ApiResponse<ListingDetailResponse> = {
    data: listing,
    error: null
  }
  return NextResponse.json(success)
}
```

---

**Need help?** Read the full [TYPE_CONVENTIONS.md](./TYPE_CONVENTIONS.md) guide.
