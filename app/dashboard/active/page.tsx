"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Package, Truck, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { DeliveryTracker } from "@/components/dashboard/delivery-tracker";
import { LiveTracker } from "@/components/dashboard/live-tracker";
import { getDonationsByDonor, getRequestsByNGO, subscribeToVolunteerDeliveries, subscribeToDonorDeliveries } from "@/lib/firestore";
import type { Donation, NGORequest, Delivery } from "@/lib/types";
import { EmptyState } from "@/components/ui/empty-state";

const statusConfig = {
  active: { label: "Awaiting Match", color: "bg-accent/10 text-accent-foreground border border-accent/20", icon: Clock },
  matched: { label: "Matched", color: "bg-primary/10 text-primary border border-primary/20", icon: Package },
  picked: { label: "In Transit", color: "bg-chart-2/10 text-chart-2 border border-chart-2/20", icon: Truck },
  delivered: { label: "Delivered", color: "bg-primary/10 text-primary border border-primary/20", icon: CheckCircle },
  expired: { label: "Expired", color: "bg-destructive/10 text-destructive border border-destructive/20", icon: Clock },
};

export default function ActiveDonationsPage() {
  const { userProfile } = useAuth();

  const [activeItems, setActiveItems] = useState<any[]>([]);
  const [activeDeliveries, setActiveDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!userProfile) return;

    if (userProfile.role === "volunteer") {
      const unsubscribe = subscribeToVolunteerDeliveries(userProfile.uid, (deliveries) => {
        setActiveDeliveries(deliveries.filter((d) => d.delivery_status !== "delivered"));
        setLoading(false);
      });
      unsubscribeRef.current = unsubscribe;
    } else if (userProfile.role === "donor") {
      const unsubscribe = subscribeToDonorDeliveries(userProfile.uid, (deliveries) => {
        setActiveDeliveries(deliveries.filter((d) => d.delivery_status !== "delivered"));
        setLoading(false);
      });
      unsubscribeRef.current = unsubscribe;
      
      // Also fetch donations (not in real-time for now to keep it simple, or could use another listener)
      getDonationsByDonor(userProfile.uid).then(items => {
        setActiveItems(items.filter((d: any) => !["delivered", "expired"].includes(d.status)));
      });
    } else if (userProfile.role === "ngo") {
      // For NGO, we now have a dedicated page, but let's keep this functional too
      getRequestsByNGO(userProfile.uid).then(items => {
        setActiveItems(items.filter((r: any) => !["fulfilled", "cancelled"].includes(r.status)));
        setLoading(false);
      });
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [userProfile]);

  const formatTimeLeft = (timestamp: any) => {
    if (!timestamp) return "Unknown";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diff = date.getTime() - Date.now();
    if (diff < 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return "Unknown";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diff = Date.now() - date.getTime();
    if (diff < 0) return "Just now";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours > 0) return `${hours}h ago`;
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}m ago`;
  };

  const isDonor = userProfile?.role === "donor";
  const isVolunteer = userProfile?.role === "volunteer";

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Volunteer view with delivery tracker
  if (isVolunteer) {
    const activeDelivery = activeDeliveries.find(
      (d) => d.delivery_status !== "delivered" && d.delivery_status !== "pending"
    ) || activeDeliveries[0];

    return (
      <div className="space-y-6 pb-20 lg:pb-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Active Delivery</h1>
          <p className="text-muted-foreground">Track and manage your current delivery task</p>
        </div>

        {!activeDelivery ? (
          <EmptyState
            icon={CheckCircle}
            title="No active deliveries"
            description="You don't have any active deliveries right now."
            action={
              <Button asChild>
                <Link href="/dashboard/available">Find Deliveries</Link>
              </Button>
            }
          />
        ) : (
          <DeliveryTracker
            delivery={activeDelivery}
            userRole="volunteer"
            onStatusUpdate={(updated) => {
              setActiveDeliveries((prev) =>
                prev.map((d) =>
                  d.id === activeDelivery.id ? { ...d, ...updated } : d
                )
              );
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isDonor ? "Active Donations" : "Active Requests"}
          </h1>
          <p className="text-muted-foreground">
            Track your current food {isDonor ? "donations" : "requests"}
          </p>
        </div>
        {isDonor && (
          <Button asChild>
            <Link href="/dashboard/donate">Add Donation</Link>
          </Button>
        )}
      </div>

      {/* Show active delivery tracker if donor has a delivery in progress */}
      {isDonor && activeDeliveries.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Live Tracking
          </h2>
          {activeDeliveries.map(delivery => (
            <LiveTracker 
              key={delivery.id} 
              delivery={delivery} 
              userRole="donor"
            />
          ))}
        </div>
      )}

      {activeItems.length === 0 && activeDeliveries.length === 0 ? (
        <EmptyState
          icon={Package}
          title={`No active ${isDonor ? "donations" : "requests"}`}
          description={`You don't have any active ${isDonor ? "donations" : "requests"} right now.`}
          action={
            <Button asChild>
              <Link href={isDonor ? "/dashboard/donate" : "/dashboard/request"}>
                Create {isDonor ? "Donation" : "Request"}
              </Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {activeItems.map((item) => {
            const statusKey = item.status as keyof typeof statusConfig;
            const status = statusConfig[statusKey] || statusConfig.active;
            const StatusIcon = status.icon;

            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <span className="capitalize">{item.food_type?.replace("-", " ") || "Food"}</span>
                        <span className="text-muted-foreground font-normal text-sm">
                          {item.quantity} {item.quantity_unit || (item.people_count ? `meals for ${item.people_count}` : "")}
                        </span>
                      </h3>
                      {item.location?.address && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {item.location.address}
                        </p>
                      )}
                    </div>
                    <Badge className={status.color}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {status.label}
                    </Badge>
                  </div>

                  <div className="grid gap-2 text-sm">
                    {item.expiry_time && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Expires</span>
                        <span
                          className={`font-medium ${item.expiry_time.toDate &&
                              item.expiry_time.toDate().getTime() - Date.now() < 3 * 60 * 60 * 1000
                              ? "text-destructive"
                              : "text-foreground"
                            }`}
                        >
                          {formatTimeLeft(item.expiry_time)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span className="text-foreground">{formatTimeAgo(item.created_at)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
