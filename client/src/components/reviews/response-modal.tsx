import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Sparkles, RefreshCw, Send, Save } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useRespondToReview, useAISuggestions, useImproveResponse } from "@/hooks/use-reviews";
import { useDrafts } from "@/hooks/use-local-storage";
import type { ReviewWithResponse, Template } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { showToast } from "@/lib/pwa";

interface ResponseModalProps {
  review: ReviewWithResponse;
  onClose: () => void;
}

export default function ResponseModal({ review, onClose }: ResponseModalProps) {
  const [responseContent, setResponseContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const { saveDraft, getDraft } = useDrafts();

  const respondToReview = useRespondToReview();
  const aiSuggestions = useAISuggestions(review.id);
  const improveResponse = useImproveResponse();

  // Load templates
  const { data: templates } = useQuery<Template[]>({
    queryKey: ['/api/templates'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/templates');
      return response.json();
    },
  });

  // Load draft on mount
  useEffect(() => {
    const draft = getDraft(review.id);
    if (draft) {
      setResponseContent(draft);
    } else if (review.response) {
      setResponseContent(review.response);
    }
  }, [review.id, review.response, getDraft]);

  // Generate AI suggestions on mount
  useEffect(() => {
    if (review.responseStatus === "pending" || review.responseStatus === "priority") {
      aiSuggestions.mutate();
    }
  }, [review.responseStatus]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-0.5">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < rating ? "text-yellow-400" : "text-gray-300"}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        ))}
      </div>
    );
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setResponseContent(template.content);
  };

  const handleAISuggestionSelect = (suggestion: string) => {
    setResponseContent(suggestion);
  };

  const handleImproveWithAI = async () => {
    if (!responseContent.trim()) {
      showToast("Please enter a response first", "error");
      return;
    }

    try {
      const result = await improveResponse.mutateAsync({
        response: responseContent,
        reviewContent: review.content,
        rating: review.rating,
      });
      setResponseContent(result.improvedResponse);
      showToast("Response improved with AI!", "success");
    } catch (error) {
      showToast("Failed to improve response", "error");
    }
  };

  const handleSaveDraft = () => {
    if (responseContent.trim()) {
      saveDraft(review.id, responseContent);
    }
  };

  const handleSendResponse = async () => {
    if (!responseContent.trim()) {
      showToast("Please enter a response", "error");
      return;
    }

    try {
      await respondToReview.mutateAsync({
        id: review.id,
        response: responseContent,
        status: "responded",
      });
      showToast("Response sent successfully!", "success");
      onClose();
    } catch (error) {
      showToast("Failed to send response", "error");
    }
  };

  const characterCount = responseContent.length;
  const maxCharacters = 500;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scroll">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Respond to Review</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Review Summary */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Avatar>
                <AvatarFallback className="bg-blue-500 text-white font-medium">
                  {review.customerInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-slate-900">{review.customerName}</h3>
                <div className="flex items-center space-x-2">
                  {renderStars(review.rating)}
                  <span className="text-xs text-slate-500">
                    {formatDistanceToNow(new Date(review.datePosted), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-700">{review.content}</p>
          </div>

          {/* Quick Templates */}
          {templates && templates.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-slate-900 mb-3">Quick Templates</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {templates.slice(0, 4).map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="p-3 text-left border border-slate-200 rounded-lg hover:bg-slate-50 text-sm transition-colors"
                  >
                    <div className="font-medium text-slate-900">{template.name}</div>
                    <div className="text-slate-600 text-xs mt-1 capitalize">
                      For {template.category} reviews
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* AI Suggestions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-900">AI Suggestions</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => aiSuggestions.mutate()}
                disabled={aiSuggestions.isPending}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${aiSuggestions.isPending ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
            </div>

            {aiSuggestions.isPending ? (
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="border border-slate-200 rounded-lg p-3">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            ) : aiSuggestions.data?.suggestions ? (
              <div className="space-y-2">
                {aiSuggestions.data.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleAISuggestionSelect(suggestion.suggestion)}
                    className="w-full p-3 text-left border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 text-sm transition-colors"
                  >
                    <div className="flex items-start space-x-2">
                      <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-blue-700">{suggestion.suggestion}</div>
                        <div className="text-blue-600 text-xs mt-1 flex items-center space-x-2">
                          <span>✨ AI Recommended</span>
                          <Badge variant="outline" className="text-xs">
                            {suggestion.tone}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-slate-500 text-sm">
                Click "Regenerate" to get AI suggestions for this review
              </div>
            )}
          </div>

          <Separator />

          {/* Response Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-900">Your Response</label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleImproveWithAI}
                disabled={improveResponse.isPending || !responseContent.trim()}
              >
                <Sparkles className={`h-3 w-3 mr-1 ${improveResponse.isPending ? 'animate-spin' : ''}`} />
                Improve with AI
              </Button>
            </div>
            <Textarea
              value={responseContent}
              onChange={(e) => setResponseContent(e.target.value)}
              placeholder="Write your response here..."
              className="min-h-32 resize-none"
              maxLength={maxCharacters}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-slate-500">
                {characterCount}/{maxCharacters} characters
              </div>
              {characterCount > maxCharacters * 0.8 && (
                <div className="text-xs text-orange-600">
                  {characterCount > maxCharacters ? "Character limit exceeded" : "Approaching limit"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex space-x-3 pt-6 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={!responseContent.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={handleSendResponse}
            disabled={!responseContent.trim() || characterCount > maxCharacters || respondToReview.isPending}
            className="flex-1"
          >
            <Send className="h-4 w-4 mr-2" />
            {respondToReview.isPending ? "Sending..." : "Send Response"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
