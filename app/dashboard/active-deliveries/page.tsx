"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Clock, MapPin, Loader2, Package } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { subscribeToNGODeliveries } from "@/lib/firestore";
import { LiveTracker } from "@/components/dashboard/live-tracker";
import type { Delivery } from "@/lib/types";

export default function NGOActiveDeliveriesPage() {
  const { userProfile } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!userProfile || userProfile.role !== "ngo") return;

    const unsubscribe = subscribeToNGODeliveries(userProfile.uid, (data) => {
      // Filter for deliveries that are in progress (not delivered or pending)
      setDeliveries(data.filter(d => ["assigned", "pickup", "in_transit"].includes(d.delivery_status)));
      setLoading(false);
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [userProfile]);

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
        <h1 className="text-2xl font-bold text-foreground">Active Incoming Deliveries</h1>
        <p className="text-muted-foreground">Track real-time location and status of your food parcels</p>
      </div>

      {deliveries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Truck className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No active incoming deliveries</h3>
            <p className="text-muted-foreground text-center mt-2">
              You don&apos;t have any parcels currently being delivered to you.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 max-w-2xl mx-auto">
          {deliveries.map((delivery) => (
            <LiveTracker 
              key={delivery.id} 
              delivery={delivery} 
              userRole="ngo"
            />
          ))}
        </div>
      )}
    </div>
  );
}
