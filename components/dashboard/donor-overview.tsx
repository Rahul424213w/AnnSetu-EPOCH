"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, CheckCircle, Clock, PlusCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { subscribeToDonorDonations } from "@/lib/firestore";
import type { Donation } from "@/lib/types";

export function DonorOverview() {
  const { userProfile } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;
    const unsubscribe = subscribeToDonorDonations(userProfile.uid, (items) => {
      setDonations(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userProfile]);

  const activeDonations = donations.filter((d) => d.status === "active" || d.status === "matched").length;
  const completedDonations = donations.filter((d) => d.status === "delivered").length;
  const pendingPickups = donations.filter((d) => d.status === "matched").length;
  const totalMealsSaved = donations
    .filter((d) => d.status === "delivered")
    .reduce((acc, d) => acc + (d.quantity || 0), 0);

  const recentDonations = donations.slice(0, 5);

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp) return "Unknown";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    const minutes = Math.floor(diff / (1000 * 60));
    return minutes > 0 ? `${minutes}m ago` : "Just now";
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Active";
      case "matched": return "Matched";
      case "picked": return "In Transit";
      case "delivered": return "Delivered";
      case "expired": return "Expired";
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Donor Dashboard</h1>
          <p className="text-muted-foreground">Manage your food donations and track impact</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/donate">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Donation
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Donations
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{activeDonations}</div>
            <p className="text-xs text-muted-foreground">Awaiting pickup</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{completedDonations}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Pickups
            </CardTitle>
            <Clock className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{pendingPickups}</div>
            <p className="text-xs text-muted-foreground">Volunteer assigned</p>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary">
              Total Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalMealsSaved}</div>
            <p className="text-xs text-primary/70">Meals saved</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Donations</CardTitle>
            <CardDescription>Your latest food donation activities</CardDescription>
          </CardHeader>
          <CardContent>
            {recentDonations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No donations yet. Create your first donation!
              </p>
            ) : (
              <div className="space-y-4">
                {recentDonations.map((donation) => (
                  <div key={donation.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-foreground capitalize">
                        {donation.food_type?.replace("-", " ")} Food
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {donation.quantity} {donation.quantity_unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        donation.status === "delivered"
                          ? "bg-primary/10 text-primary"
                          : donation.status === "expired"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-accent/10 text-accent-foreground"
                      }`}>
                        {getStatusLabel(donation.status)}
                      </span>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatTimeAgo(donation.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for donors</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/donate">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Donation
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/active">
                <Package className="mr-2 h-4 w-4" />
                View Active Donations
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/history">
                <CheckCircle className="mr-2 h-4 w-4" />
                View Donation History
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
