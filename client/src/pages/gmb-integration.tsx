import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Building2, 
  MapPin, 
  Star, 
  RotateCw, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  MessageSquare
} from "lucide-react";

interface GMBStatus {
  isConnected: boolean;
  account: any;
  hasTokens: boolean;
}

interface GMBAccount {
  name: string;
  accountName: string;
  type: string;
  role: string;
}

interface GMBLocation {
  name: string;
  locationName: string;
  primaryPhone?: string;
  websiteUrl?: string;
  address?: {
    addressLines?: string[];
    locality?: string;
    administrativeArea?: string;
    postalCode?: string;
    regionCode?: string;
  };
}

interface GMBReview {
  reviewId: string;
  reviewer?: {
    displayName?: string;
  };
  starRating?: string;
  comment?: string;
  createTime?: string;
  reviewReply?: {
    comment?: string;
    updateTime?: string;
  };
}

export default function GMBIntegration() {
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check GMB connection status
  const { data: gmbStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['/api/gmb/status'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/gmb/status');
      return response.json();
    }
  });

  // Get auth URL for GMB connection
  const { data: authData } = useQuery({
    queryKey: ['/api/gmb/auth-url'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/gmb/auth-url');
      return response.json();
    },
    enabled: !gmbStatus?.isConnected
  });

  // Get GMB accounts
  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ['/api/gmb/accounts'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/gmb/accounts');
      return response.json();
    },
    enabled: gmbStatus?.isConnected
  });

  // Get locations for selected account
  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ['/api/gmb/locations', selectedAccount],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/gmb/locations/${selectedAccount}`);
      return response.json();
    },
    enabled: !!selectedAccount
  });

  // Get reviews for selected location
  const { data: gmbReviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['/api/gmb/reviews', selectedAccount, selectedLocation],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/gmb/reviews/${selectedAccount}/${selectedLocation}`);
      return response.json();
    },
    enabled: !!selectedAccount && !!selectedLocation
  });

  // Sync reviews mutation
  const syncReviewsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/gmb/sync/${selectedAccount}/${selectedLocation}`);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Reviews Synced",
        description: `Successfully synced ${data.syncedCount} new reviews from Google My Business.`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
    },
    onError: () => {
      toast({
        title: "Sync Failed",
        description: "Failed to sync reviews from Google My Business.",
        variant: "destructive"
      });
    }
  });

  const handleConnect = () => {
    if (authData?.authUrl) {
      window.open(authData.authUrl, '_blank', 'width=500,height=600');
    }
  };

  const handleSync = () => {
    if (selectedAccount && selectedLocation) {
      syncReviewsMutation.mutate();
    }
  };

  const convertStarRating = (rating?: string): number => {
    const ratingMap: { [key: string]: number } = {
      'ONE': 1, 'TWO': 2, 'THREE': 3, 'FOUR': 4, 'FIVE': 5
    };
    return rating ? ratingMap[rating] || 0 : 0;
  };

  const formatAddress = (address?: any): string => {
    if (!address) return 'No address available';
    const parts = [
      ...(address.addressLines || []),
      address.locality,
      address.administrativeArea,
      address.postalCode
    ].filter(Boolean);
    return parts.join(', ');
  };

  if (statusLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Google My Business Integration</h1>
        <p className="text-muted-foreground mt-2">
          Connect your Google My Business account to automatically sync and manage reviews.
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {gmbStatus?.isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Connected to Google My Business</span>
                <Badge variant="secondary">Active</Badge>
              </div>
              
              {gmbStatus.account && (
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Account Details</h4>
                  <p className="text-sm text-muted-foreground">
                    Account: {gmbStatus.account.accountName || 'Business Account'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Role: {gmbStatus.account.role || 'Owner'}
                  </p>
                </div>
              )}

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your Google My Business account is connected and ready to sync reviews.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                <span className="font-medium">Not Connected</span>
                <Badge variant="outline">Disconnected</Badge>
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Connect your Google My Business account to start syncing reviews automatically.
                </AlertDescription>
              </Alert>

              <Button onClick={handleConnect} className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Connect Google My Business
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account & Location Selection */}
      {gmbStatus?.isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>Select Business Location</CardTitle>
            <CardDescription>
              Choose the business account and location to manage reviews for.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Accounts */}
            <div>
              <h4 className="font-medium mb-3">Business Accounts</h4>
              {accountsLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-16 bg-muted rounded"></div>
                </div>
              ) : (
                <div className="grid gap-3">
                  {accounts?.map((account: GMBAccount) => (
                    <div
                      key={account.name}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedAccount === account.name.split('/')[1]
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedAccount(account.name.split('/')[1])}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{account.accountName}</p>
                          <p className="text-sm text-muted-foreground">
                            Type: {account.type} • Role: {account.role}
                          </p>
                        </div>
                        <Badge variant={account.role === 'OWNER' ? 'default' : 'secondary'}>
                          {account.role}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Locations */}
            {selectedAccount && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-3">Business Locations</h4>
                  {locationsLoading ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-16 bg-muted rounded"></div>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {locations?.map((location: GMBLocation) => (
                        <div
                          key={location.name}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedLocation === location.name.split('/')[3]
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedLocation(location.name.split('/')[3])}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <p className="font-medium">{location.locationName}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatAddress(location.address)}
                            </p>
                            {location.primaryPhone && (
                              <p className="text-sm text-muted-foreground">
                                Phone: {location.primaryPhone}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Review Management */}
      {selectedAccount && selectedLocation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Review Management
              </span>
              <Button 
                onClick={handleSync} 
                disabled={syncReviewsMutation.isPending}
                className="flex items-center gap-2"
              >
                <RotateCw className={`h-4 w-4 ${syncReviewsMutation.isPending ? 'animate-spin' : ''}`} />
                {syncReviewsMutation.isPending ? 'Syncing...' : 'Sync Reviews'}
              </Button>
            </CardTitle>
            <CardDescription>
              Sync reviews from Google My Business to your local review management system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reviewsLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-muted rounded"></div>
                ))}
              </div>
            ) : gmbReviews && gmbReviews.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Found {gmbReviews.length} reviews from Google My Business
                </p>
                
                <div className="grid gap-4">
                  {gmbReviews.slice(0, 5).map((review: GMBReview) => (
                    <div key={review.reviewId} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {review.reviewer?.displayName || 'Anonymous'}
                          </span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < convertStarRating(review.starRating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.createTime && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(review.createTime).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      {review.comment && (
                        <p className="text-sm mb-2 text-muted-foreground">
                          "{review.comment}"
                        </p>
                      )}
                      
                      {review.reviewReply && (
                        <div className="mt-3 p-3 bg-muted rounded border-l-4 border-primary">
                          <p className="text-sm">
                            <strong>Your Reply:</strong> {review.reviewReply.comment}
                          </p>
                          {review.reviewReply.updateTime && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Replied on {new Date(review.reviewReply.updateTime).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {gmbReviews.length > 5 && (
                  <p className="text-center text-sm text-muted-foreground">
                    Showing 5 of {gmbReviews.length} reviews. Click "Sync Reviews" to import all reviews.
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No reviews found for this location.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}