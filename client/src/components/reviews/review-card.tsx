import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Reply, Edit, Share2, Phone, Save, Send } from "lucide-react";
import type { ReviewWithResponse } from "@shared/schema";
import ResponseModal from "./response-modal";

interface ReviewCardProps {
  review: ReviewWithResponse;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const [showResponseModal, setShowResponseModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "responded":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "priority":
        return "bg-red-100 text-red-800";
      case "draft":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBorder = (status: string) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "responded":
        return "status-responded";
      case "priority":
        return "status-priority";
      case "draft":
        return "status-draft";
      default:
        return "";
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="stars">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < rating ? "star-filled" : "star-empty"}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        ))}
      </div>
    );
  };

  const getResponseButton = () => {
    switch (review.responseStatus) {
      case "priority":
        return (
          <Button 
            onClick={() => setShowResponseModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white flex items-center space-x-2"
          >
            <Reply className="h-4 w-4" />
            <span>Respond Now</span>
          </Button>
        );
      case "pending":
        return (
          <Button 
            onClick={() => setShowResponseModal(true)}
            className="flex items-center space-x-2"
          >
            <Reply className="h-4 w-4" />
            <span>Respond</span>
          </Button>
        );
      case "draft":
        return (
          <Button 
            onClick={() => setShowResponseModal(true)}
            className="flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>Send Response</span>
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card className={`review-card ${getStatusBorder(review.responseStatus)}`}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarFallback className="bg-blue-500 text-white font-medium">
                  {review.customerInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-slate-900">{review.customerName}</h3>
                <div className="flex items-center space-x-2">
                  {renderStars(review.rating)}
                  <span className="text-sm text-slate-500">
                    {formatDistanceToNow(new Date(review.datePosted), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
            <Badge className={getStatusColor(review.responseStatus)}>
              {review.responseStatus.charAt(0).toUpperCase() + review.responseStatus.slice(1)}
            </Badge>
          </div>

          {/* Review Content */}
          <p className="text-slate-700 mb-4">{review.content}</p>

          {/* Response Section */}
          {review.response && (
            <div className="bg-slate-50 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <Reply className="h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700">Your Response</span>
              </div>
              <p className="text-sm text-slate-600">{review.response}</p>
            </div>
          )}

          {/* AI Suggestions for Pending */}
          {review.responseStatus === "pending" && (
            <div className="ai-suggestion mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                </svg>
                <span className="text-sm font-medium text-blue-700">AI Suggestion</span>
              </div>
              <p className="text-sm text-blue-700">
                "Thank you for your feedback, {review.customerName}! We appreciate your patience during busy times and are working to improve our service speed. We'd love to welcome you back for an even better experience!"
              </p>
            </div>
          )}

          {/* Priority Alert */}
          {review.responseStatus === "priority" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                </svg>
                <span className="text-sm font-medium text-red-700">Critical Review - Immediate Response Needed</span>
              </div>
              <p className="text-sm text-red-700">
                "We sincerely apologize for the poor experience, {review.customerName}. This doesn't reflect our usual standards. Please contact us directly so we can make this right and ensure it doesn't happen again."
              </p>
            </div>
          )}

          {/* Draft Content */}
          {review.responseStatus === "draft" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <Edit className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">Draft Response</span>
              </div>
              <p className="text-sm text-yellow-700">{review.response}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {review.responseStatus === "responded" ? (
                <>
                  <Button variant="outline" size="sm">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit Response
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                </>
              ) : review.responseStatus === "priority" ? (
                <>
                  {getResponseButton()}
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                </>
              ) : review.responseStatus === "draft" ? (
                <>
                  {getResponseButton()}
                  <Button variant="outline" size="sm">
                    <Save className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  {getResponseButton()}
                  <Button variant="outline" size="sm">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M7 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                    </svg>
                  </Button>
                  <Button variant="outline" size="sm">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                    </svg>
                  </Button>
                </>
              )}
            </div>
            {review.responseDate && (
              <span className="text-xs text-slate-500">
                Responded {formatDistanceToNow(new Date(review.responseDate), { addSuffix: true })}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {showResponseModal && (
        <ResponseModal
          review={review}
          onClose={() => setShowResponseModal(false)}
        />
      )}
    </>
  );
}
