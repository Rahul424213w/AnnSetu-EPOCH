"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Clock, MapPin, Store, Package, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getRequestsByNGO, getMatchesByRequest, getDonationById, updateMatch, createDelivery } from "@/lib/firestore";
import type { Match, Donation } from "@/lib/types";
import { toast } from "sonner";
import { calculateETA } from "@/lib/delivery-engine";

// Extend Match type for UI
type EnrichedMatch = Match & {
  donation: Donation;
  distance: number;
  volunteer?: string;
  eta?: string;
};

export default function MatchesPage() {
  const { user, userProfile } = useAuth();
  const [pendingMatches, setPendingMatches] = useState<EnrichedMatch[]>([]);
  const [acceptedMatches, setAcceptedMatches] = useState<EnrichedMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<EnrichedMatch | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadMatches() {
      if (!user) return;

      try {
        // Find all requests by this NGO
        const requests = await getRequestsByNGO(user.uid);
        const requestIds = requests.map(r => r.id).filter(Boolean) as string[];

        // Batch get all matches
        const allMatchesPromises = requestIds.map(id => getMatchesByRequest(id));
        const allMatchesResults = await Promise.all(allMatchesPromises);
        let allMatches: Match[] = allMatchesResults.flat();

        // Limit to top 50 matches to prevent memory issues
        allMatches = allMatches.slice(0, 50);

        // Batch enrich matches with donation details using Promise.all
        const enrichedMatches: EnrichedMatch[] = [];

        // Process in parallel with concurrency limit
        const BATCH_SIZE = 10;
        for (let i = 0; i < allMatches.length; i += BATCH_SIZE) {
          const batch = allMatches.slice(i, i + BATCH_SIZE);
          const batchResults = await Promise.all(batch.map(async (match) => {
            const donation = await getDonationById(match.donation_id);
            if (!donation) return null;

            // Compute real distance from donation/request locations
            let dist = 0;
            let etaMinutes = 0;
            const request = requests.find(r => r.id === match.request_id);
            if (donation.location && request?.location) {
              try {
                const { getMatchDistance } = await import("@/lib/matching-engine");
                dist = Math.round(getMatchDistance(donation, request) * 10) / 10;
                const etaData = calculateETA(donation.location.lat, donation.location.lng, request.location.lat, request.location.lng, 1);
                etaMinutes = etaData.etaMinutes;
              } catch { dist = 0; etaMinutes = 0; }
            }
            const eta = etaMinutes < 60 ? `~${etaMinutes} min` : `~${Math.round(etaMinutes / 60)}h`;

            return {
              ...match,
              donation,
              distance: dist,
              eta,
            } as EnrichedMatch;
          }));

          // Filter out nulls and add to results
          enrichedMatches.push(...batchResults.filter((m): m is EnrichedMatch => m !== null));
        }

        if (isMounted) {
          setPendingMatches(enrichedMatches.filter(m => m.status === "pending"));
          setAcceptedMatches(enrichedMatches.filter(m => m.status === "accepted" || m.status === "completed"));
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading matches:", error);
        toast.error("Failed to load matches");
        if (isMounted) setIsLoading(false);
      }
    }

    loadMatches();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const formatTimeLeft = (date: any) => {
    if (!date) return "Unknown";
    const expiryDate = date.toDate ? date.toDate() : new Date(date);
    const diff = expiryDate.getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleAccept = (match: EnrichedMatch) => {
    setSelectedMatch(match);
    setShowAcceptDialog(true);
  };

  const handleReject = async (match: EnrichedMatch) => {
    try {
      await updateMatch(match.id!, { status: "rejected" });
      setPendingMatches(prev => prev.filter(m => m.id !== match.id));
      toast.success("Match rejected");
    } catch (error) {
      console.error("Error rejecting match:", error);
      toast.error("Failed to reject match");
    }
  };

  const confirmAccept = async () => {
    if (!selectedMatch || !selectedMatch.id) return;

    setIsProcessing(true);
    try {
      // 1. Update match status
      await updateMatch(selectedMatch.id, { status: "accepted" });

      // 2. Create delivery record
      const requests = await getRequestsByNGO(user!.uid);
      const request = requests.find(r => r.id === selectedMatch.request_id);

      if (request) {
        await createDelivery({
          match_id: selectedMatch.id,
          donation: selectedMatch.donation,
          request,
          pickup_status: "pending",
          delivery_status: "pending",
        });
      }

      // 3. Update UI
      setPendingMatches(prev => prev.filter(m => m.id !== selectedMatch.id));
      setAcceptedMatches(prev => [...prev, { ...selectedMatch, status: "accepted" }]);

      toast.success("Match accepted! Delivery requested.");
      setShowAcceptDialog(false);
      setSelectedMatch(null);
    } catch (error) {
      console.error("Error accepting match:", error);
      toast.error("Failed to accept match");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Donation Matches</h1>
        <p className="text-muted-foreground">Review and accept matched donations</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingMatches.length})
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted ({acceptedMatches.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : pendingMatches.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No pending matches"
              description="New matches will appear here based on your active requests."
            />
          ) : (
            <div className="grid gap-4">
              {pendingMatches.map((match) => (
                <Card key={match.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-primary" />
                          {match.donation?.donor_name || "Donor"}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {match.donation?.location?.address || "Unknown"} ({match.distance} km away)
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-primary/10 text-primary">
                          {match.score}% Match
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 text-sm mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Food Type</span>
                        <span className="font-medium text-foreground capitalize">
                          {match.donation?.food_type?.replace("-", " ") || "Food"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Quantity</span>
                        <span className="font-medium text-foreground">
                          {match.donation?.quantity || 0} {match.donation?.quantity_unit || "items"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Expires In</span>
                        <span className={`font-medium flex items-center gap-1 ${
                          (match.donation?.expiry_time?.toDate?.()?.getTime() || 0) - Date.now() < 3 * 60 * 60 * 1000
                            ? "text-destructive"
                            : "text-foreground"
                        }`}>
                          <Clock className="h-3 w-3" />
                          {formatTimeLeft(match.donation?.expiry_time)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => handleAccept(match)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Accept
                      </Button>
                      <Button variant="outline" onClick={() => handleReject(match)}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="accepted" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : acceptedMatches.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="No accepted matches"
              description="Accepted donations being delivered will appear here."
            />
          ) : (
            <div className="grid gap-4">
              {acceptedMatches.map((match) => (
                <Card key={match.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Store className="h-4 w-4 text-primary" />
                          {match.donation?.donor_name || "Donor"}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {match.donation?.location?.address || "Unknown"}
                        </CardDescription>
                      </div>
                      <Badge className="bg-chart-2/10 text-chart-2">
                        {match.status === "completed" ? "Completed" : "In Transit"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Food</span>
                        <span className="font-medium text-foreground">
                          {match.donation?.quantity || 0} {match.donation?.quantity_unit || "items"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Volunteer</span>
                        <span className="font-medium text-foreground">{match.volunteer || "Pending Assignment"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">ETA</span>
                        <span className="font-medium text-primary">{match.eta || "-"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Accept Confirmation Dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Donation</DialogTitle>
            <DialogDescription>
              Are you sure you want to accept this donation from {selectedMatch?.donation?.donor_name}?
            </DialogDescription>
          </DialogHeader>

          {selectedMatch && (
            <div className="rounded-lg border border-border p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Food Type</span>
                <span className="capitalize">{selectedMatch.donation?.food_type || "Food"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span>{selectedMatch.donation?.quantity || 0} {selectedMatch.donation?.quantity_unit || "items"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distance</span>
                <span>{selectedMatch.distance} km</span>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 rounded-lg bg-accent/10 p-3 text-sm">
            <AlertTriangle className="h-4 w-4 text-accent mt-0.5 shrink-0" />
            <p className="text-muted-foreground">
              Once accepted, a volunteer will be assigned to pick up and deliver this donation to your location.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAcceptDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAccept} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Confirm Accept"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
