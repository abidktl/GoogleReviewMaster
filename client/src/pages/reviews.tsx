import { useState } from "react";
import { useReviews } from "@/hooks/use-reviews";
import ReviewFilters from "@/components/reviews/review-filters";
import ReviewCard from "@/components/reviews/review-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Reviews() {
  const [filters, setFilters] = useState<{
    rating?: number;
    status?: string;
    dateRange?: string;
  }>({});

  const { data: reviews, isLoading, error } = useReviews(filters);

  if (error) {
    return (
      <div className="p-6">
        <div className="error-state rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Reviews</h3>
          <p className="text-red-700 mb-4">
            We encountered an error while fetching your reviews. Please try again.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Reviews</h1>
        <p className="text-slate-600">
          Manage and respond to your Google My Business reviews
        </p>
      </div>

      {/* Filters */}
      <ReviewFilters onFiltersChange={setFilters} />

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-16 w-full mb-4" />
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reviews Grid */}
      {!isLoading && reviews && (
        <>
          {reviews.length === 0 ? (
            <div className="empty-state">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No reviews found</h3>
              <p className="text-slate-600 mb-4">
                {Object.keys(filters).some(key => filters[key as keyof typeof filters]) 
                  ? "Try adjusting your filters to see more reviews."
                  : "No reviews match your current filters."
                }
              </p>
              {Object.keys(filters).some(key => filters[key as keyof typeof filters]) && (
                <Button variant="outline" onClick={() => setFilters({})}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>

              {/* Load More */}
              {reviews.length >= 6 && (
                <div className="text-center mt-8">
                  <Button variant="outline">
                    Load More Reviews
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Summary Stats */}
      {!isLoading && reviews && reviews.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">
              {reviews.length}
            </div>
            <div className="text-sm text-slate-600">Total Reviews</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {reviews.filter(r => r.responseStatus === "pending" || r.responseStatus === "priority").length}
            </div>
            <div className="text-sm text-slate-600">Pending Responses</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {reviews.filter(r => r.responseStatus === "responded").length}
            </div>
            <div className="text-sm text-slate-600">Responded</div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {reviews.filter(r => r.responseStatus === "draft").length}
            </div>
            <div className="text-sm text-slate-600">Drafts</div>
          </div>
        </div>
      )}
    </div>
  );
}
