"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { MapPicker } from "@/components/map-picker";
import { useAuth } from "@/lib/auth-context";
import { createRequest } from "@/lib/firestore";
import { Timestamp } from "firebase/firestore";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { FoodType, UrgencyLevel, Location } from "@/lib/types";

export default function RequestPage() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [foodType, setFoodType] = useState<FoodType>("veg");
  const [quantity, setQuantity] = useState("");
  const [peopleCount, setPeopleCount] = useState("");
  const [urgency, setUrgency] = useState<UrgencyLevel>("medium");
  const [timeWindowStart, setTimeWindowStart] = useState("");
  const [timeWindowEnd, setTimeWindowEnd] = useState("");
  const [hasStorage, setHasStorage] = useState(false);
  const [location, setLocation] = useState<Location | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !location) {
      setError("Please select a location on the map");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createRequest({
        ngo_id: userProfile.uid,
        ngo_name: userProfile.name,
        food_type: foodType,
        quantity: parseFloat(quantity),
        people_count: parseInt(peopleCount),
        urgency,
        time_window_start: Timestamp.fromDate(new Date(timeWindowStart)),
        time_window_end: Timestamp.fromDate(new Date(timeWindowEnd)),
        storage_capability: hasStorage,
        location,
        status: "active",
      });

      router.push("/dashboard/matches");
    } catch (err) {
      console.error(err);
      setError("Failed to create request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-20 lg:pb-0">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Add Food Request</h1>
          <p className="text-muted-foreground">Request food donations for your community</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
            <CardDescription>Specify your food requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}

            {/* Food Type */}
            <div className="space-y-3">
              <Label className="text-foreground">Food Type Needed</Label>
              <RadioGroup
                value={foodType}
                onValueChange={(value) => setFoodType(value as FoodType)}
                className="flex flex-wrap gap-4"
              >
                <Label
                  htmlFor="req-veg"
                  className={`flex items-center gap-2 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                    foodType === "veg" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <RadioGroupItem value="veg" id="req-veg" />
                  <span className="text-foreground">Vegetarian</span>
                </Label>
                <Label
                  htmlFor="req-non-veg"
                  className={`flex items-center gap-2 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                    foodType === "non-veg" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <RadioGroupItem value="non-veg" id="req-non-veg" />
                  <span className="text-foreground">Non-Vegetarian</span>
                </Label>
                <Label
                  htmlFor="req-packaged"
                  className={`flex items-center gap-2 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                    foodType === "packaged" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <RadioGroupItem value="packaged" id="req-packaged" />
                  <span className="text-foreground">Packaged</span>
                </Label>
              </RadioGroup>
            </div>

            {/* Quantity and People */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-foreground">Quantity Needed (meals/kg)</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="e.g., 50"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  min="1"
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="people" className="text-foreground">Number of People</Label>
                <Input
                  id="people"
                  type="number"
                  placeholder="e.g., 100"
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(e.target.value)}
                  required
                  min="1"
                  className="bg-input border-border"
                />
              </div>
            </div>

            {/* Urgency */}
            <div className="space-y-2">
              <Label htmlFor="urgency" className="text-foreground">Urgency Level</Label>
              <Select value={urgency} onValueChange={(v) => setUrgency(v as UrgencyLevel)}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High - Needed immediately</SelectItem>
                  <SelectItem value="medium">Medium - Within a few hours</SelectItem>
                  <SelectItem value="low">Low - Can wait</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Time Window */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="time-start" className="text-foreground">Delivery From</Label>
                <Input
                  id="time-start"
                  type="datetime-local"
                  value={timeWindowStart}
                  onChange={(e) => setTimeWindowStart(e.target.value)}
                  required
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time-end" className="text-foreground">Delivery Until</Label>
                <Input
                  id="time-end"
                  type="datetime-local"
                  value={timeWindowEnd}
                  onChange={(e) => setTimeWindowEnd(e.target.value)}
                  required
                  className="bg-input border-border"
                />
              </div>
            </div>

            {/* Storage Capability */}
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <Label htmlFor="storage" className="text-foreground">Storage Capability</Label>
                <p className="text-sm text-muted-foreground">
                  Can you store food if delivery is early?
                </p>
              </div>
              <Switch
                id="storage"
                checked={hasStorage}
                onCheckedChange={setHasStorage}
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label className="text-foreground">Delivery Location</Label>
              <MapPicker value={location} onChange={setLocation} />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Request...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
