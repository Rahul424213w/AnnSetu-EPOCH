"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MapPicker } from "@/components/map-picker";
import { useAuth } from "@/lib/auth-context";
import { createDonation, triggerMatchingForDonation } from "@/lib/firestore";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Timestamp } from "firebase/firestore";
import { Loader2, ArrowLeft, Upload, X, Camera } from "lucide-react";
import Link from "next/link";
import type { FoodType, Location } from "@/lib/types";
import { toast } from "sonner";

export default function DonatePage() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [foodType, setFoodType] = useState<FoodType>("veg");
  const [quantity, setQuantity] = useState("");
  const [quantityUnit, setQuantityUnit] = useState<"kg" | "meals">("meals");
  const [expiryTime, setExpiryTime] = useState("");
  const [pickupStart, setPickupStart] = useState("");
  const [pickupEnd, setPickupEnd] = useState("");
  const [packagingCondition, setPackagingCondition] = useState<"good" | "fair" | "poor">("good");
  const [location, setLocation] = useState<Location | undefined>();
  const [notes, setNotes] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !location) {
      setError("Please select a location on the map");
      return;
    }

    if (!imageFile) {
      setError("Please upload a photo of the food. It is mandatory for quality assurance.");
      toast.error("Food image is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Upload image to Firebase Storage
      // Demo users have no real Firebase Auth token → Storage rejects uploads.
      // Use a placeholder so the rest of the flow works.
      let imageUrl = "";
      const isDemo = userProfile.uid.startsWith("demo-");
      if (isDemo) {
        imageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80";
      } else if (imageFile) {
        const storageRef = ref(storage, `donations/${userProfile.uid}_${Date.now()}_${imageFile.name}`);
        const uploadResult = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }

      // 2. Create donation in Firestore
      const donationId = await createDonation({
        donor_id: userProfile.uid,
        donor_name: userProfile.name,
        food_type: foodType,
        quantity: parseFloat(quantity),
        quantity_unit: quantityUnit,
        expiry_time: Timestamp.fromDate(new Date(expiryTime)),
        pickup_window_start: Timestamp.fromDate(new Date(pickupStart)),
        pickup_window_end: Timestamp.fromDate(new Date(pickupEnd)),
        packaging_condition: packagingCondition,
        location,
        image_url: imageUrl,
        status: "active",
      });

      // Trigger matching engine in background — non-blocking
      triggerMatchingForDonation(donationId).catch((err) =>
        console.error("Background matching error:", err)
      );

      router.push("/dashboard/active");
    } catch (err) {
      console.error(err);
      setError("Failed to create donation. Please try again.");
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
          <h1 className="text-2xl font-bold text-foreground">Add Donation</h1>
          <p className="text-muted-foreground">Share your surplus food with those in need</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Food Details</CardTitle>
            <CardDescription>Provide information about the food you want to donate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}

            {/* Food Type */}
            <div className="space-y-3">
              <Label className="text-foreground">Food Type</Label>
              <RadioGroup
                value={foodType}
                onValueChange={(value) => setFoodType(value as FoodType)}
                className="flex flex-wrap gap-4"
              >
                <Label
                  htmlFor="veg"
                  className={`flex items-center gap-2 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                    foodType === "veg" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <RadioGroupItem value="veg" id="veg" />
                  <span className="text-foreground">Vegetarian</span>
                </Label>
                <Label
                  htmlFor="non-veg"
                  className={`flex items-center gap-2 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                    foodType === "non-veg" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <RadioGroupItem value="non-veg" id="non-veg" />
                  <span className="text-foreground">Non-Vegetarian</span>
                </Label>
                <Label
                  htmlFor="packaged"
                  className={`flex items-center gap-2 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                    foodType === "packaged" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <RadioGroupItem value="packaged" id="packaged" />
                  <span className="text-foreground">Packaged</span>
                </Label>
              </RadioGroup>
            </div>

            {/* Quantity */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-foreground">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="e.g., 25"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  min="1"
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit" className="text-foreground">Unit</Label>
                <Select value={quantityUnit} onValueChange={(v) => setQuantityUnit(v as "kg" | "meals")}>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meals">Meals</SelectItem>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Expiry Time */}
            <div className="space-y-2">
              <Label htmlFor="expiry" className="text-foreground">Expiry Time</Label>
              <Input
                id="expiry"
                type="datetime-local"
                value={expiryTime}
                onChange={(e) => setExpiryTime(e.target.value)}
                required
                className="bg-input border-border"
              />
              <p className="text-xs text-muted-foreground">When will this food no longer be safe to consume?</p>
            </div>

            {/* Pickup Window */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pickup-start" className="text-foreground">Pickup From</Label>
                <Input
                  id="pickup-start"
                  type="datetime-local"
                  value={pickupStart}
                  onChange={(e) => setPickupStart(e.target.value)}
                  required
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickup-end" className="text-foreground">Pickup Until</Label>
                <Input
                  id="pickup-end"
                  type="datetime-local"
                  value={pickupEnd}
                  onChange={(e) => setPickupEnd(e.target.value)}
                  required
                  className="bg-input border-border"
                />
              </div>
            </div>

            {/* Packaging Condition */}
            <div className="space-y-2">
              <Label htmlFor="packaging" className="text-foreground">Packaging Condition</Label>
              <Select value={packagingCondition} onValueChange={(v) => setPackagingCondition(v as "good" | "fair" | "poor")}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">Good - Well sealed and fresh</SelectItem>
                  <SelectItem value="fair">Fair - Adequate packaging</SelectItem>
                  <SelectItem value="poor">Poor - Needs immediate pickup</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label className="text-foreground">Pickup Location</Label>
              <MapPicker value={location} onChange={setLocation} />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-foreground">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special instructions for pickup..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-input border-border"
                rows={3}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <Label className="text-foreground flex items-center gap-2">
                Food Photo <span className="text-destructive">*</span>
              </Label>
              
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
              />

              {!imagePreview ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer bg-muted/30"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 rounded-full bg-background border border-border group-hover:scale-110 transition-transform shadow-sm">
                      <Camera className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-foreground">Click to take or upload a photo</p>
                      <p className="text-xs text-muted-foreground mt-1">Clear photos help NGOs verify food quality</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative group rounded-2xl overflow-hidden border border-border aspect-video bg-muted">
                  <Image
                    src={imagePreview}
                    alt="Food preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <Button 
                      type="button" 
                      variant="secondary" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      Change
                    </Button>
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Donation...
                </>
              ) : (
                "Submit Donation"
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
