"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MapPin,
  Store,
  Building2,
  Clock,
  Package,
  ArrowRight,
  Navigation,
  Loader2,
  Bike,
  IndianRupee,
  Route,
  Zap,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { subscribeToAvailableDeliveries, acceptDelivery } from "@/lib/firestore";
import { getMatchDistance } from "@/lib/matching-engine";
import type { Delivery } from "@/lib/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const urgencyConfig = {
  high: { label: "URGENT", color: "bg-destructive text-destructive-foreground", pulse: true },
  medium: { label: "Medium", color: "bg-accent/10 text-accent-foreground border border-accent/20", pulse: false },
  low: { label: "Low", color: "bg-muted text-muted-foreground border border-border", pulse: false },
};

export default function AvailableDeliveriesPage() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [availableDeliveries, setAvailableDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  // Real-time listener instead of one-shot fetch
  useEffect(() => {
    const unsubscribe = subscribeToAvailableDeliveries((deliveries) => {
      setAvailableDeliveries(deliveries);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

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

  const getDistance = (delivery: Delivery): number => {
    if (delivery.distance) return delivery.distance;
    if (delivery.donation?.location && delivery.request?.location) {
      return Math.round(
        getMatchDistance(delivery.donation as any, delivery.request as any) * 10
      ) / 10;
    }
    return 0;
  };

  const getEstimatedTime = (distanceKm: number): string => {
    const minutes = Math.ceil(distanceKm * 4); // ~15 km/h avg city speed
    if (minutes < 60) return `${minutes} min`;
    return `${Math.round(minutes / 60)}h ${minutes % 60}m`;
  };

  const handleAccept = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setShowAcceptDialog(true);
  };

  const openMaps = (lat: number, lng: number, label?: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(url, "_blank");
  };

  const confirmAccept = async () => {
    if (!selectedDelivery?.id || !userProfile) return;

    setIsAccepting(true);
    try {
      await acceptDelivery(
        selectedDelivery.id,
        userProfile.uid,
        userProfile.name,
        userProfile.phone
      );

      toast.success("Delivery accepted! Navigating to pickup...");
      setShowAcceptDialog(false);
      setSelectedDelivery(null);

      // Auto-open Google Maps for pickup navigation
      if (selectedDelivery.donation?.location?.lat) {
        openMaps(
          selectedDelivery.donation.location.lat,
          selectedDelivery.donation.location.lng,
          selectedDelivery.donation.location.address
        );
      }

      router.push("/dashboard/active");
    } catch (error) {
      console.error("Error accepting delivery:", error);
      toast.error("Failed to accept delivery. Please try again.");
    } finally {
      setIsAccepting(false);
    }
  };

  const getDeliveryUrgency = (delivery: Delivery) => {
    return delivery.request?.urgency || "medium";
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Swiggy-style header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bike className="h-6 w-6 text-primary" />
            Available Pickups
          </h1>
          <p className="text-muted-foreground">Accept a delivery to start earning</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-green-600">Live</span>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 text-center">
          <p className="text-2xl font-bold text-primary">{availableDeliveries.length}</p>
          <p className="text-xs text-muted-foreground">Available</p>
        </div>
        <div className="rounded-xl bg-muted/60 border border-border p-3 text-center">
          <p className="text-2xl font-bold text-foreground">
            {availableDeliveries.filter(d => getDeliveryUrgency(d) === "high").length}
          </p>
          <p className="text-xs text-muted-foreground">Urgent</p>
        </div>
        <div className="rounded-xl bg-muted/60 border border-border p-3 text-center">
          <p className="text-2xl font-bold text-foreground">
            {availableDeliveries.length > 0
              ? `${Math.min(...availableDeliveries.map(d => getDistance(d)).filter(d => d > 0), 99).toFixed(1)}`
              : "—"}
          </p>
          <p className="text-xs text-muted-foreground">Nearest (km)</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Finding nearby pickups...</p>
        </div>
      ) : availableDeliveries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No pickups right now</h3>
            <p className="text-muted-foreground text-center mt-2 max-w-xs">
              New deliveries appear here in real-time. Stay online to get notified instantly!
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-primary">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>Listening for new orders...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {availableDeliveries.map((delivery) => {
            const urgencyLevel = getDeliveryUrgency(delivery);
            const urgency = urgencyConfig[urgencyLevel as keyof typeof urgencyConfig] || urgencyConfig.medium;
            const distance = getDistance(delivery);
            const estimatedTime = getEstimatedTime(distance);

            return (
              <Card
                key={delivery.id}
                className="overflow-hidden hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-primary"
                onClick={() => handleAccept(delivery)}
              >
                {/* Top bar — Swiggy-style order header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={urgency.color}>
                      {urgency.pulse && <Zap className="h-3 w-3 mr-0.5" />}
                      {urgency.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground capitalize font-medium">
                      {delivery.donation?.food_type?.replace("-", " ") || "Food"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {formatTimeLeft(delivery.donation?.expiry_time)}
                  </div>
                </div>

                <CardContent className="pt-0 pb-4">
                  {/* Route Visualization — Swiggy pickup style */}
                  <div className="flex items-stretch gap-3 mb-4 p-3 bg-muted/30 rounded-xl">
                    <div className="flex flex-col items-center gap-0.5 shrink-0 py-1">
                      <div className="h-3 w-3 rounded-full bg-green-500 ring-2 ring-green-500/20" />
                      <div className="flex-1 w-px bg-border border-l border-dashed border-muted-foreground/30" />
                      <div className="h-3 w-3 rounded-full bg-destructive ring-2 ring-destructive/20" />
                    </div>
                    <div className="flex-1 space-y-3 min-w-0">
                      <div>
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                          <Store className="h-3.5 w-3.5 text-green-600 shrink-0" />
                          <span className="truncate">{delivery.donation?.donor_name || "Donor"}</span>
                        </div>
                        <p className="text-xs text-muted-foreground pl-5 truncate">
                          {delivery.donation?.location?.address || "Pickup location"}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                          <Building2 className="h-3.5 w-3.5 text-destructive shrink-0" />
                          <span className="truncate">{delivery.request?.ngo_name || "NGO"}</span>
                        </div>
                        <p className="text-xs text-muted-foreground pl-5 truncate">
                          {delivery.request?.location?.address || "Drop location"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom stats row — Swiggy-style */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-foreground font-medium">
                        <Route className="h-4 w-4 text-primary" />
                        {distance > 0 ? `${distance} km` : "—"}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {estimatedTime}
                      </div>
                      <div className="flex items-center gap-1 text-foreground font-medium">
                        <Package className="h-3.5 w-3.5 text-accent" />
                        {delivery.donation?.quantity || 0} {delivery.donation?.quantity_unit || "items"}
                      </div>
                    </div>
                    <Button size="sm" className="gap-1.5 shadow-sm">
                      <Navigation className="h-3.5 w-3.5" />
                      Accept
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Accept Confirmation Dialog — Swiggy-style summary */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bike className="h-5 w-5 text-primary" />
              Confirm Pickup
            </DialogTitle>
            <DialogDescription>
              Accept this delivery and navigate to the pickup location.
            </DialogDescription>
          </DialogHeader>

          {selectedDelivery && (
            <div className="space-y-4">
              {/* Route card */}
              <div className="rounded-xl border border-border p-4 space-y-4">
                {/* Pickup */}
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10 shrink-0">
                    <Store className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-green-600 uppercase tracking-wide font-semibold">Pickup</p>
                    <p className="font-semibold text-foreground truncate">
                      {selectedDelivery.donation?.donor_name || "Donor"}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        {selectedDelivery.donation?.location?.address || "Address not set"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pl-4">
                  <div className="h-px flex-1 border-t border-dashed border-border" />
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <div className="h-px flex-1 border-t border-dashed border-border" />
                </div>

                {/* Delivery */}
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 shrink-0">
                    <Building2 className="h-4 w-4 text-destructive" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-destructive uppercase tracking-wide font-semibold">Drop-off</p>
                    <p className="font-semibold text-foreground truncate">
                      {selectedDelivery.request?.ngo_name || "NGO"}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        {selectedDelivery.request?.location?.address || "Address not set"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <div className="rounded-lg bg-muted/60 p-3">
                  <p className="font-bold text-foreground text-base">
                    {getDistance(selectedDelivery)} km
                  </p>
                  <p className="text-muted-foreground text-xs mt-0.5">Distance</p>
                </div>
                <div className="rounded-lg bg-muted/60 p-3">
                  <p className="font-bold text-foreground text-base">
                    {getEstimatedTime(getDistance(selectedDelivery))}
                  </p>
                  <p className="text-muted-foreground text-xs mt-0.5">Est. Time</p>
                </div>
                <div className="rounded-lg bg-muted/60 p-3">
                  <p className="font-bold text-foreground text-base">
                    {selectedDelivery.donation?.quantity || 0}
                  </p>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    {selectedDelivery.donation?.quantity_unit || "items"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowAcceptDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAccept} disabled={isAccepting} className="gap-2">
              {isAccepting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4" />
                  Accept & Navigate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
