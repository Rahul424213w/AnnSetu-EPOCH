"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Package, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getDonationsByDonor, getRequestsByNGO, getDeliveriesByVolunteer } from "@/lib/firestore";
import type { Donation, NGORequest, Delivery } from "@/lib/types";

const statusConfig = {
  delivered: { label: "Delivered", color: "bg-primary/10 text-primary", icon: CheckCircle },
  expired: { label: "Expired", color: "bg-destructive/10 text-destructive", icon: XCircle },
  cancelled: { label: "Cancelled", color: "bg-muted text-muted-foreground", icon: Clock },
};

export default function HistoryPage() {
  const { userProfile } = useAuth();
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      if (!userProfile) return;
      try {
        if (userProfile.role === "donor") {
          const items = await getDonationsByDonor(userProfile.uid);
          // Assuming history contains delivered, expired, or cancelled
          setHistoryItems(items.filter((d: any) => ["delivered", "expired", "cancelled"].includes(d.status)));
        } else if (userProfile.role === "ngo") {
          const items = await getRequestsByNGO(userProfile.uid);
          setHistoryItems(items.filter((r: any) => ["delivered", "completed", "cancelled"].includes(r.status)));
        } else if (userProfile.role === "volunteer") {
          const items = await getDeliveriesByVolunteer(userProfile.uid);
          setHistoryItems(items.filter((d: any) => ["delivered", "cancelled"].includes(d.delivery_status)));
        }
      } catch (err) {
        console.error("Failed to load history items", err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [userProfile]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown date";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isDonor = userProfile?.role === "donor";
  const isNGO = userProfile?.role === "ngo";

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate summary stats dynamically
  const completedCount = historyItems.filter(i => i.status === "delivered" || i.delivery_status === "delivered" || i.status === "fulfilled").length;
  
  const totalAmount = historyItems.reduce((acc, i) => {
    const isComplete = i.status === "delivered" || i.delivery_status === "delivered" || i.status === "fulfilled";
    if (isComplete) {
      // For volunteer deliveries, use nested donation quantity
      if (userProfile?.role === "volunteer") {
        return acc + (i.donation?.quantity || 0);
      }
      return acc + (i.quantity || 0);
    }
    return acc;
  }, 0);

  const uniqueEntities = new Set(
    historyItems
      .map(i => {
        if (isDonor) return i.matched_ngo;
        if (isNGO) return i.donor_id;
        // Volunteer: use nested request ngo_id
        return i.request?.ngo_id;
      })
      .filter(Boolean)
  ).size;

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {isDonor ? "Donation History" : isNGO ? "Request History" : "Delivery History"}
        </h1>
        <p className="text-muted-foreground">
          View your past {isDonor ? "donations" : isNGO ? "requests" : "deliveries"}
        </p>
      </div>

      {historyItems.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground">No history yet</h3>
            <p className="text-muted-foreground text-center mt-2">
              Your completed {isDonor ? "donations" : isNGO ? "requests" : "deliveries"} will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {historyItems.map((item) => {
            const currentStatus = item.status || item.delivery_status || "delivered";
            // Map completed to delivered for UI purposes
            const displayStatus = currentStatus === "completed" ? "delivered" : currentStatus;
            const status = statusConfig[displayStatus as keyof typeof statusConfig] || statusConfig.delivered;
            const StatusIcon = status.icon;

            // Build display text based on role
            let itemTitle = "";
            let itemSubtitle = "";

            if (isDonor) {
              itemTitle = `${(item.food_type || "Food").replace("-", " ")} — ${item.quantity || 0} ${item.quantity_unit || "items"}`;
              itemSubtitle = item.status === "delivered" ? "Successfully delivered" : item.status === "expired" ? "Food expired" : "Cancelled";
            } else if (isNGO) {
              itemTitle = `${(item.food_type || "Food").replace("-", " ")} — ${item.quantity || 0} meals`;
              itemSubtitle = item.status === "fulfilled" || item.status === "delivered"
                ? `Received for ${item.people_count || 0} people`
                : "Request cancelled";
            } else {
              // Volunteer — items are Delivery objects with nested donation/request
              const donorName = item.donation?.donor_name || "Donor";
              const ngoName = item.request?.ngo_name || "NGO";
              itemTitle = `${donorName} → ${ngoName}`;
              itemSubtitle = `${item.donation?.quantity || 0} ${item.donation?.quantity_unit || "items"}${item.distance ? ` • ${item.distance} km` : ""}`;
            }
            
            return (
              <Card key={item.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <StatusIcon className={`h-5 w-5 ${
                          displayStatus === "delivered" ? "text-primary" : "text-destructive"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground capitalize">
                          {itemTitle}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {itemSubtitle}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={status.color}>
                        {status.label}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(item.updated_at || item.created_at)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      {historyItems.length > 0 && (
        <Card>
          <CardContent className="py-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {completedCount}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {totalAmount}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isDonor ? "Meals/kg Saved" : isNGO ? "Received" : "Deliveries"}
                </p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {uniqueEntities}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isDonor ? "NGOs Helped" : isNGO ? "Donors" : "Unique NGOs"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

