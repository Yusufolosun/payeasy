import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header Skeleton */}
      <header className="bg-white border-b border-gray-200 h-16 sticky top-0 z-30 shadow-sm animate-pulse" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Skeleton */}
          <aside className="w-full lg:w-80 flex-shrink-0 hidden lg:block">
            <div className="h-[600px] bg-white rounded-xl border border-gray-200 animate-pulse" />
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Toolbar Skeleton */}
            <div className="flex justify-between items-center mb-6">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full animate-pulse"
                >
                  {/* Image Placeholder */}
                  <div className="h-56 w-full bg-gray-200" />
                  
                  {/* Content Placeholder */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div className="w-full space-y-2">
                        {/* Title */}
                        <div className="h-6 bg-gray-200 rounded w-3/4" />
                        {/* Location */}
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                      {/* Metadata */}
                      <div className="flex gap-4">
                        <div className="h-4 w-8 bg-gray-200 rounded" />
                        <div className="h-4 w-8 bg-gray-200 rounded" />
                      </div>
                      {/* Price */}
                      <div className="h-6 w-20 bg-gray-200 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
