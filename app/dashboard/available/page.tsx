"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock, MapPin, Package, Truck, Brain, Activity,
  AlertTriangle, Timer, Thermometer, TrendingUp,
  CheckCircle, Navigation, Zap
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { subscribeToAvailableDeliveries, acceptDelivery } from "@/lib/firestore";
import { checkMLHealth } from "@/lib/ml-client";
import type { Delivery, MLPredictionOutput } from "@/lib/types";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/empty-state";

// Extended delivery with ML enrichment
interface EnrichedDelivery extends Delivery {
  etaData?: { distanceKm: number; etaMinutes: number; trafficLevel: string };
  spoilage?: { risk: string; score: number };
  mlPrediction?: MLPredictionOutput;
}

// Traffic level type
type TrafficLevel = 'Low' | 'Moderate' | 'Heavy' | 'Severe';

export default function AvailableDeliveriesPage() {
  const { user, userProfile } = useAuth();
  const [deliveries, setDeliveries] = useState<EnrichedDelivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [mlStatus, setMLStatus] = useState<{ online: boolean; modelLoaded: boolean }>({
    online: false, modelLoaded: false,
  });
  const [traffic, setTraffic] = useState<{ factor: number; level: TrafficLevel }>({ factor: 1.2, level: 'Moderate' });

  // Check ML service health
  useEffect(() => {
    checkMLHealth().then((health) => {
      setMLStatus({
        online: health.status === "healthy" || health.status === "ok",
        modelLoaded: health.model_loaded,
      });
    });
  }, []);

  // Get traffic factor on mount (client-side only) - lazy loaded
  useEffect(() => {
    let mounted = true;
    import("@/lib/delivery-engine").then(({ getTrafficFactor }) => {
      if (mounted) setTraffic(getTrafficFactor());
    });
    return () => { mounted = false; };
  }, []);

  // Subscribe to available deliveries - enrich data once on snapshot
  useEffect(() => {
    let isMounted = true;

    const unsub = subscribeToAvailableDeliveries(async (raw) => {
      if (!isMounted) return;

      // Lazy load calculation functions
      const { calculateETA, calculateSpoilageRisk } = await import("@/lib/delivery-engine");

      // Process in batches to avoid blocking the main thread
      const enriched: EnrichedDelivery[] = raw.map((delivery) => {
        const d = delivery.donation;
        const r = delivery.request;

        let etaData;
        let spoilage;
        let mlPrediction: MLPredictionOutput | undefined;

        if (d?.location && r?.location) {
          // Synchronous calculations only - no async ML calls on every snapshot
          etaData = calculateETA(d.location.lat, d.location.lng, r.location.lat, r.location.lng, d.quantity);
          spoilage = calculateSpoilageRisk(d.food_type || "packaged", etaData.etaMinutes);

          // Use stored ML score - don't call ML API on every real-time update
          if (delivery.ml_score !== undefined) {
            mlPrediction = {
              ml_score: delivery.ml_score,
              priority: delivery.ml_priority || "MEDIUM",
            };
          }
        }

        return { ...delivery, etaData, spoilage, mlPrediction };
      });

      // Sort by ML score if available and online, otherwise by creation date
      enriched.sort((a, b) => {
        if (mlStatus.online) {
          const scoreA = a.ml_score ?? 0;
          const scoreB = b.ml_score ?? 0;
          if (scoreA !== scoreB) return scoreB - scoreA;
        }
        
        // Fallback: sort by creation time (newest first)
        const timeA = a.created_at?.seconds || 0;
        const timeB = b.created_at?.seconds || 0;
        return timeB - timeA;
      });

      if (isMounted) {
        setDeliveries(enriched);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, [mlStatus.online]);

  const handleAccept = async (delivery: EnrichedDelivery) => {
    if (!user || !delivery.id) return;
    setAcceptingId(delivery.id);
    try {
      await acceptDelivery(
        delivery.id,
        user.uid,
        userProfile?.name || user.displayName || "Volunteer",
        userProfile?.phone
      );
      toast.success("Delivery accepted! Check your active deliveries.");
    } catch (err) {
      console.error("Accept error:", err);
      toast.error("Failed to accept delivery");
    } finally {
      setAcceptingId(null);
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "HIGH": return "bg-red-500/15 text-red-400 border-red-500/30";
      case "MEDIUM": return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "LOW": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getSpoilageColor = (risk?: string) => {
    switch (risk) {
      case "Critical": return "text-red-400";
      case "High": return "text-orange-400";
      case "Medium": return "text-amber-400";
      default: return "text-emerald-400";
    }
  };

  const getScoreGradient = (score?: number) => {
    if (!score) return "from-muted to-muted";
    if (score > 0.75) return "from-red-500/20 to-orange-500/20";
    if (score >= 0.4) return "from-amber-500/20 to-yellow-500/20";
    return "from-emerald-500/20 to-teal-500/20";
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            {mlStatus.online && <Brain className="h-6 w-6 text-primary" />}
            {mlStatus.online ? "ML-Powered Deliveries" : "Available Deliveries"}
          </h1>
          <p className="text-muted-foreground">
            {mlStatus.online 
              ? "AI-prioritised deliveries — highest impact shown first" 
              : "List of all available food delivery tasks"}
          </p>
        </div>

        {/* ML Status + Traffic */}
        <div className="flex items-center gap-3">
          {mlStatus.online && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              <Activity className="h-3 w-3" />
              ML Online
            </div>
          )}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
            traffic.level === "Heavy" || traffic.level === "Severe"
              ? "bg-red-500/10 text-red-400 border-red-500/30"
              : traffic.level === "Moderate"
              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
          }`}>
            <Navigation className="h-3 w-3" />
            Traffic: {traffic.level}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="relative">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary/30 border-t-primary"></div>
            <Brain className="h-4 w-4 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-sm text-muted-foreground">Scoring deliveries with ML model…</p>
        </div>
      ) : deliveries.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No deliveries available"
          description="New donation matches will appear here, scored and ranked by our ML priority model."
        />
      ) : (
        <div className="grid gap-4">
          {deliveries.map((delivery, idx) => {
            const priority = delivery.mlPrediction?.priority || delivery.ml_priority;
            const mlScore = delivery.mlPrediction?.ml_score ?? delivery.ml_score;

            return (
              <Card
                key={delivery.id || idx}
                className={`relative overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/5 border-border/50`}
              >
                {/* Priority gradient bar */}
                {mlStatus.online && <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${getScoreGradient(mlScore)}`} />}

                <CardHeader className="pb-3 pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Truck className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate">
                          {delivery.donation?.donor_name || "Donor"} → {delivery.request?.ngo_name || "NGO"}
                        </span>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {delivery.donation?.location?.address || "Pickup"} → {delivery.request?.location?.address || "Drop-off"}
                        </span>
                      </CardDescription>
                    </div>

                    {/* ML Priority Badge */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {mlStatus.online && priority && (
                        <Badge className={`${getPriorityColor(priority)} border text-xs font-semibold`}>
                          <Zap className="h-3 w-3 mr-1" />
                          {priority}
                        </Badge>
                      )}
                      {mlStatus.online && mlScore !== undefined && (
                        <span className="text-xs text-muted-foreground font-mono">
                          ML: {(mlScore * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Info Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Food Info */}
                    <div className="bg-muted/30 rounded-lg p-2.5 space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Food</p>
                      <p className="text-sm font-semibold text-foreground capitalize">
                        {delivery.donation?.food_type?.replace("-", " ") || "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {delivery.donation?.quantity || 0} {delivery.donation?.quantity_unit || "items"}
                      </p>
                    </div>

                    {/* Distance & ETA */}
                    <div className="bg-muted/30 rounded-lg p-2.5 space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">ETA</p>
                      <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                        <Timer className="h-3.5 w-3.5 text-primary" />
                        {delivery.etaData ? `${delivery.etaData.etaMinutes} min` : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {delivery.etaData?.distanceKm || delivery.distance || 0} km
                      </p>
                    </div>

                    {/* Spoilage Risk */}
                    <div className="bg-muted/30 rounded-lg p-2.5 space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Spoilage</p>
                      <p className={`text-sm font-semibold flex items-center gap-1 ${getSpoilageColor(delivery.spoilage?.risk)}`}>
                        <Thermometer className="h-3.5 w-3.5" />
                        {delivery.spoilage?.risk || "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {delivery.spoilage ? `${(delivery.spoilage.score * 100).toFixed(0)}% risk` : "—"}
                      </p>
                    </div>

                    {/* Urgency */}
                    <div className="bg-muted/30 rounded-lg p-2.5 space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Urgency</p>
                      <p className="text-sm font-semibold text-foreground capitalize flex items-center gap-1">
                        <AlertTriangle className={`h-3.5 w-3.5 ${
                          delivery.request?.urgency === "high" ? "text-red-400" :
                          delivery.request?.urgency === "medium" ? "text-amber-400" : "text-emerald-400"
                        }`} />
                        {delivery.request?.urgency || "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {delivery.request?.people_count || 0} people
                      </p>
                    </div>
                  </div>

                  {/* ML Score Bar */}
                  {mlStatus.online && mlScore !== undefined && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          ML Priority Score
                        </span>
                        <span className="font-mono font-semibold text-foreground">
                          {(mlScore * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${
                            mlScore > 0.75 ? "from-red-500 to-orange-500" :
                            mlScore >= 0.4 ? "from-amber-500 to-yellow-500" :
                            "from-emerald-500 to-teal-500"
                          }`}
                          style={{ width: `${Math.min(mlScore * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Accept Button */}
                  <Button
                    className="w-full"
                    size="lg"
                    disabled={acceptingId === delivery.id}
                    onClick={() => handleAccept(delivery)}
                  >
                    {acceptingId === delivery.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-background/30 border-t-background mr-2" />
                        Accepting…
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Accept Delivery
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
