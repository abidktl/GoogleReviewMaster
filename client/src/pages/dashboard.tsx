import { useState } from "react";
import { useReviews } from "@/hooks/use-reviews";
import StatsCards from "@/components/dashboard/stats-cards";
import ReviewCard from "@/components/reviews/review-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";

export default function Dashboard() {
  // Get recent reviews (limit to 6 for dashboard)
  const { data: reviews, isLoading } = useReviews();
  const recentReviews = reviews?.slice(0, 6) || [];

  if (isLoading) {
    return (
      <div className="p-6">
        {/* Stats Cards Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-24 mt-4" />
            </div>
          ))}
        </div>

        {/* Recent Reviews Loading */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
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
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Stats Cards */}
      <StatsCards />

      {/* Recent Activity Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Recent Reviews</h2>
          <Button variant="outline" size="sm">
            View All Reviews
          </Button>
        </div>

        {recentReviews.length === 0 ? (
          <div className="empty-state">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No reviews yet</h3>
            <p className="text-slate-600 mb-4">When customers leave reviews, they'll appear here.</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Sample Review
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {recentReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}

        {recentReviews.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline">
              Load More Reviews
            </Button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>
              </svg>
            </div>
            <h3 className="font-medium text-slate-900">Quick Response</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Respond to reviews quickly using AI-powered suggestions and templates.
          </p>
          <Button size="sm" className="w-full">
            Get Started
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
              </svg>
            </div>
            <h3 className="font-medium text-slate-900">Manage Templates</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Create and organize response templates for different types of reviews.
          </p>
          <Button size="sm" variant="outline" className="w-full">
            View Templates
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
              </svg>
            </div>
            <h3 className="font-medium text-slate-900">Analytics</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">
            Track your review response performance and customer satisfaction trends.
          </p>
          <Button size="sm" variant="outline" className="w-full">
            View Analytics
          </Button>
        </div>
      </div>
    </div>
  );
}
