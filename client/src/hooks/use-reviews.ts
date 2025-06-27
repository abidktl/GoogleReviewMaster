import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ReviewWithResponse, DashboardStats } from "@shared/schema";

interface ReviewFilters {
  rating?: number;
  status?: string;
  dateRange?: string;
  search?: string;
}

export function useReviews(filters?: ReviewFilters) {
  return useQuery<ReviewWithResponse[]>({
    queryKey: ['/api/reviews', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.rating) params.append('rating', filters.rating.toString());
      if (filters?.status) params.append('status', filters.status);
      if (filters?.dateRange) params.append('dateRange', filters.dateRange);
      if (filters?.search) params.append('search', filters.search);
      
      const response = await apiRequest('GET', `/api/reviews?${params}`);
      return response.json();
    },
  });
}

export function useReview(id: number) {
  return useQuery<ReviewWithResponse>({
    queryKey: ['/api/reviews', id],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/reviews/${id}`);
      return response.json();
    },
    enabled: !!id,
  });
}

export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/dashboard/stats');
      return response.json();
    },
  });
}

export function useRespondToReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, response, status }: { id: number; response: string; status: string }) => {
      const result = await apiRequest('PATCH', `/api/reviews/${id}/response`, {
        response,
        status
      });
      return result.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
  });
}

export function useAISuggestions(reviewId: number) {
  return useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/reviews/${reviewId}/ai-suggestions`);
      return response.json();
    },
  });
}

export function useImproveResponse() {
  return useMutation({
    mutationFn: async ({ response, reviewContent, rating }: { 
      response: string; 
      reviewContent: string; 
      rating: number;
    }) => {
      const result = await apiRequest('POST', '/api/ai/improve-response', {
        response,
        reviewContent,
        rating
      });
      return result.json();
    },
  });
}

export function useExportReviews() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/export/reviews', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reviews-export.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      return { success: true };
    },
  });
}
