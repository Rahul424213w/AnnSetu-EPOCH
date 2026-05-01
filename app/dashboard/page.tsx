"use client";

import { useAuth } from "@/lib/auth-context";
import { DonorOverview } from "@/components/dashboard/donor-overview";
import { NGOOverview } from "@/components/dashboard/ngo-overview";
import { VolunteerOverview } from "@/components/dashboard/volunteer-overview";

export default function DashboardPage() {
  const { userProfile } = useAuth();

  if (!userProfile) return null;

  return (
    <div className="space-y-8">
      {userProfile.role === "donor" && <DonorOverview />}
      {userProfile.role === "ngo" && <NGOOverview />}
      {userProfile.role === "volunteer" && <VolunteerOverview />}
    </div>
  );
}
