import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { useExportReviews } from "@/hooks/use-reviews";
import { showToast } from "@/lib/pwa";

interface ReviewFiltersProps {
  onFiltersChange: (filters: {
    rating?: number;
    status?: string;
    dateRange?: string;
  }) => void;
}

export default function ReviewFilters({ onFiltersChange }: ReviewFiltersProps) {
  const [filters, setFilters] = useState({
    rating: "",
    status: "",
    dateRange: "",
  });

  const exportReviews = useExportReviews();

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Convert to the format expected by the API
    const apiFilters = {
      rating: newFilters.rating ? parseInt(newFilters.rating) : undefined,
      status: newFilters.status || undefined,
      dateRange: newFilters.dateRange || undefined,
    };
    
    onFiltersChange(apiFilters);
  };

  const handleExport = async () => {
    try {
      await exportReviews.mutateAsync();
      showToast("Reviews exported successfully!", "success");
    } catch (error) {
      showToast("Failed to export reviews", "error");
    }
  };

  return (
    <div className="review-filters">
      <div className="flex items-center space-x-4 flex-1">
        <Select value={filters.rating} onValueChange={(value) => handleFilterChange("rating", value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Ratings" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 Stars</SelectItem>
            <SelectItem value="4">4 Stars</SelectItem>
            <SelectItem value="3">3 Stars</SelectItem>
            <SelectItem value="2">2 Stars</SelectItem>
            <SelectItem value="1">1 Star</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Response Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="responded">Responded</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.dateRange} onValueChange={(value) => handleFilterChange("dateRange", value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last-7-days">Last 7 days</SelectItem>
            <SelectItem value="last-30-days">Last 30 days</SelectItem>
            <SelectItem value="last-3-months">Last 3 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex space-x-2">
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Quick Response</span>
        </Button>
        <Button 
          variant="outline" 
          onClick={handleExport}
          disabled={exportReviews.isPending}
          className="flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>{exportReviews.isPending ? "Exporting..." : "Export"}</span>
        </Button>
      </div>
    </div>
  );
}
