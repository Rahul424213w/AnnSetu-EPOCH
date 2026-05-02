"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, CheckCircle, Clock, PlusCircle, Users, Loader2, Truck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { subscribeToNGORequests, getMatchesByRequest, getDonationById } from "@/lib/firestore";
import type { NGORequest, Match, Donation, Delivery } from "@/lib/types";

interface EnrichedMatch {
  match: Match;
  donation: Donation;
}

export function NGOOverview() {
  const { userProfile } = useAuth();
  const [requests, setRequests] = useState<NGORequest[]>([]);
  const [pendingMatchList, setPendingMatchList] = useState<EnrichedMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;

    const unsubRequests = subscribeToNGORequests(userProfile.uid, async (items) => {
      setRequests(items);

      try {
        const requestIds = items.map((r) => r.id).filter(Boolean) as string[];
        const enriched: EnrichedMatch[] = [];
        for (const reqId of requestIds) {
          const matches = await getMatchesByRequest(reqId);
          for (const m of matches.filter((m) => m.status === "pending")) {
            const donation = await getDonationById(m.donation_id);
            if (donation) enriched.push({ match: m, donation });
          }
        }
        setPendingMatchList(enriched);
      } catch (err) {
        console.error("Error enriching matches:", err);
      }
      setLoading(false);
    });

    return () => {
      unsubRequests();
    };
  }, [userProfile]);

  const activeRequests = requests.filter((r) => r.status === "active").length;
  const pendingMatches = pendingMatchList.length;
  const receivedDonations = requests.filter((r) => r.status === "fulfilled").length;
  const peopleFed = requests
    .filter((r) => r.status === "fulfilled")
    .reduce((acc, r) => acc + (r.people_count || 0), 0);

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
          <h1 className="text-2xl font-bold text-foreground">NGO Dashboard</h1>
          <p className="text-muted-foreground">Manage food requests and receive donations</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/request">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Request
          </Link>
        </Button>
      </div>


      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Requests
            </CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{activeRequests}</div>
            <p className="text-xs text-muted-foreground">Awaiting match</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Matches
            </CardTitle>
            <Search className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{pendingMatches}</div>
            <p className="text-xs text-muted-foreground">Review and accept</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Received
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{receivedDonations}</div>
            <p className="text-xs text-muted-foreground">Total donations</p>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary">
              People Fed
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{peopleFed.toLocaleString()}</div>
            <p className="text-xs text-primary/70">Total beneficiaries</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pending Matches</CardTitle>
            <CardDescription>Review and accept matched donations</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingMatchList.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No pending matches. Create a food request to get matched!
              </p>
            ) : (
              <div className="space-y-4">
                {pendingMatchList.slice(0, 5).map((em) => (
                  <div key={em.match.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-foreground">{em.donation.donor_name || "Donor"}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {em.donation.food_type?.replace("-", " ")} — {em.donation.quantity} {em.donation.quantity_unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-accent/10 text-accent-foreground">
                        {em.match.score}% match
                      </span>
                      <Button size="sm" variant="outline" asChild>
                        <Link href="/dashboard/matches">View</Link>
                      </Button>
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
            <CardDescription>Common tasks for NGOs</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/request">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Food Request
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/matches">
                <Search className="mr-2 h-4 w-4" />
                View All Matches
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="/dashboard/history">
                <CheckCircle className="mr-2 h-4 w-4" />
                View History
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
