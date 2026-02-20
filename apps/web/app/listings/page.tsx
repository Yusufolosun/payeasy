import { ListingSearchResult } from '../../lib/db/types'
import ListingCard from '../../components/listings/ListingCard'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Helper to fetch data
async function getListings(page: number): Promise<ListingSearchResult> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/listings/search?page=${page}&limit=12`, {
    cache: 'no-store'
  })
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.details || res.statusText || 'Failed to fetch listings');
  }
  
  return res.json()
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const page = typeof searchParams.page === 'string' ? Number(searchParams.page) : 1
  const data = await getListings(page)

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Browse Listings</h1>
            
            {data.listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {data.listings.map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No listings found.</p>
                </div>
            )}

            {/* Pagination */}
            {data.totalPages > 1 && (
                <div className="flex justify-center items-center gap-4">
                    <Link
                        href={`/listings?page=${page - 1}`}
                        className={`px-4 py-2 rounded-lg border border-gray-300 flex items-center gap-2 bg-white hover:bg-gray-50 transition-colors ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
                        aria-disabled={page <= 1}
                    >
                        <ChevronLeft size={20} />
                        Previous
                    </Link>
                    <span className="text-gray-600 font-medium">
                        Page {page} of {data.totalPages}
                    </span>
                    <Link
                        href={`/listings?page=${page + 1}`}
                        className={`px-4 py-2 rounded-lg border border-gray-300 flex items-center gap-2 bg-white hover:bg-gray-50 transition-colors ${page >= data.totalPages ? 'pointer-events-none opacity-50' : ''}`}
                        aria-disabled={page >= data.totalPages}
                    >
                        Next
                        <ChevronRight size={20} />
                    </Link>
                </div>
            )}
        </main>
    </div>
  )
}
