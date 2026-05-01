"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, MapPin, Package, Award, Bike, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getDeliveriesByVolunteer } from "@/lib/firestore";
import type { Delivery } from "@/lib/types";

export default function CompletedDeliveriesPage() {
  const { userProfile } = useAuth();
  const [completedDeliveries, setCompletedDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompletedDeliveries() {
      if (!userProfile || userProfile.role !== "volunteer") return;
      try {
        const items = await getDeliveriesByVolunteer(userProfile.uid);
        setCompletedDeliveries(items.filter((d: Delivery) => d.delivery_status === "delivered"));
      } catch (err) {
        console.error("Failed to load completed deliveries", err);
      } finally {
        setLoading(false);
      }
    }
    loadCompletedDeliveries();
  }, [userProfile]);

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return "Unknown";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  const totalDistance = completedDeliveries.reduce((acc, d) => acc + (d.distance || 0), 0);
  const totalDeliveries = completedDeliveries.length;

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Completed Deliveries</h1>
        <p className="text-muted-foreground">Your delivery history and achievements</p>
      </div>

      {/* Achievement Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="flex items-center gap-4 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">{totalDeliveries}</p>
              <p className="text-sm text-primary/70">Deliveries Completed</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Bike className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">{totalDistance.toFixed(1)} km</p>
              <p className="text-sm text-muted-foreground">Total Distance</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <Award className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">
                {totalDeliveries >= 10 ? "Gold" : totalDeliveries >= 5 ? "Silver" : "Bronze"}
              </p>
              <p className="text-sm text-muted-foreground">Volunteer Badge</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery List */}
      {completedDeliveries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground">No completed deliveries</h3>
            <p className="text-muted-foreground text-center mt-2">
              Start accepting delivery tasks to build your history.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {completedDeliveries.map((delivery) => (
            <Card key={delivery.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {delivery.donation?.donor_name || "Donor"} → {delivery.request?.ngo_name || "NGO"}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {delivery.distance || "3.5"} km
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-primary/10 text-primary">
                      Completed
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimeAgo(delivery.updated_at || delivery.created_at)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
