"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Truck, CheckCircle, Award, Loader2, Store, Building2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  subscribeToAvailableDeliveries,
  subscribeToVolunteerDeliveries,
} from "@/lib/firestore";
import type { Delivery } from "@/lib/types";

export function VolunteerOverview() {
  const { userProfile } = useAuth();
  const [availableDeliveries, setAvailableDeliveries] = useState<Delivery[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const loadedRef = useRef({ avail: false, my: false });

  useEffect(() => {
    if (!userProfile) return;

    const checkDone = () => {
      if (loadedRef.current.avail && loadedRef.current.my) setLoading(false);
    };

    // Real-time: all pending deliveries (available for pickup)
    const unsub1 = subscribeToAvailableDeliveries((items) => {
      setAvailableDeliveries(items);
      loadedRef.current.avail = true;
      checkDone();
    });

    // Real-time: this volunteer's deliveries
    const unsub2 = subscribeToVolunteerDeliveries(userProfile.uid, (items) => {
      setMyDeliveries(items);
      loadedRef.current.my = true;
      checkDone();
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, [userProfile]);

  const activeDeliveries = myDeliveries.filter(
    (d) => d.delivery_status !== "delivered" && d.delivery_status !== "pending"
  ).length;
  const completedDeliveries = myDeliveries.filter((d) => d.delivery_status === "delivered").length;
  const totalDistance = myDeliveries
    .filter((d) => d.delivery_status === "delivered")
    .reduce((acc, d) => acc + (d.distance || 0), 0);

  const recentAvailable = availableDeliveries.slice(0, 3);

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
          <h1 className="text-2xl font-bold text-foreground">Volunteer Dashboard</h1>
          <p className="text-muted-foreground">Pick up and deliver food donations</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/available">
            <MapPin className="mr-2 h-4 w-4" />
            Find Deliveries
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Nearby
            </CardTitle>
            <MapPin className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{availableDeliveries.length}</div>
            <p className="text-xs text-muted-foreground">Ready for pickup</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Delivery
            </CardTitle>
            <Truck className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{activeDeliveries}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
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
            <div className="text-3xl font-bold text-foreground">{completedDeliveries}</div>
            <p className="text-xs text-muted-foreground">Total deliveries</p>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary">
              Distance Covered
            </CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{totalDistance.toFixed(1)} km</div>
            <p className="text-xs text-primary/70">Total traveled</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Available Deliveries</CardTitle>
            <CardDescription>Nearby deliveries you can accept</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAvailable.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No deliveries available right now. Check back soon!
              </p>
            ) : (
              <div className="space-y-4">
                {recentAvailable.map((delivery) => (
                  <div key={delivery.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-foreground flex items-center gap-1.5">
                        <Store className="h-3.5 w-3.5 text-primary" />
                        {delivery.donation?.donor_name || "Donor"}
                        <span className="text-muted-foreground mx-1">→</span>
                        <Building2 className="h-3.5 w-3.5 text-accent" />
                        {delivery.request?.ngo_name || "NGO"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {delivery.donation?.quantity || 0} {delivery.donation?.quantity_unit || "items"}
                        {delivery.distance ? ` • ${delivery.distance} km` : ""}
                      </p>
                    </div>
                    <Button size="sm" asChild>
                      <Link href="/dashboard/available">Accept</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for volunteers</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/available">
                <MapPin className="mr-2 h-4 w-4" />
                Browse Available Deliveries
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/active">
                <Truck className="mr-2 h-4 w-4" />
                View Active Delivery
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/completed">
                <CheckCircle className="mr-2 h-4 w-4" />
                Delivery History
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
