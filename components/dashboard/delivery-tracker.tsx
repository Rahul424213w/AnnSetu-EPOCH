"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Store,
  Building2,
  MapPin,
  Phone,
  CheckCircle,
  Truck,
  Package,
  Navigation,
  Camera,
  Loader2,
  ExternalLink,
  Clock,
} from "lucide-react";
import { updateDeliveryStatus } from "@/lib/firestore";
import { toast } from "sonner";
import type { Delivery, DeliveryStatus } from "@/lib/types";

interface DeliveryTrackerProps {
  delivery: Delivery;
  onStatusUpdate: (updated: Partial<Delivery>) => void;
  userRole?: string;
}

const statusSteps: { status: DeliveryStatus; label: string }[] = [
  { status: "assigned", label: "Assigned" },
  { status: "pickup", label: "At Pickup" },
  { status: "in_transit", label: "In Transit" },
  { status: "delivered", label: "Delivered" },
];

const stepIcons: Record<DeliveryStatus, React.ReactNode> = {
  pending: <Package className="h-4 w-4" />,
  assigned: <Package className="h-4 w-4" />,
  pickup: <Store className="h-4 w-4" />,
  in_transit: <Truck className="h-4 w-4" />,
  delivered: <CheckCircle className="h-4 w-4" />,
};

function openGoogleMaps(lat: number, lng: number, label?: string) {
  const destination = `${lat},${lng}`;
  const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
  window.open(url, "_blank");
}

export function DeliveryTracker({ delivery, onStatusUpdate, userRole = "volunteer" }: DeliveryTrackerProps) {
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpType, setOtpType] = useState<"pickup" | "delivery">("pickup");
  const [otpError, setOtpError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const deliveryId = delivery.id!;
  const currentStatusIndex = statusSteps.findIndex(
    (s) => s.status === delivery.delivery_status
  );

  const handleArrivedAtPickup = async () => {
    setIsUpdating(true);
    try {
      await updateDeliveryStatus(deliveryId, "pickup", { pickup_status: "arrived" });
      onStatusUpdate({ delivery_status: "pickup", pickup_status: "arrived" });
      toast.success("Marked as arrived at pickup location!");
    } catch (err) {
      toast.error("Failed to update status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStartOtpVerification = (type: "pickup" | "delivery") => {
    setOtpType(type);
    setOtpInput("");
    setOtpError("");
    setShowOtpDialog(true);
  };

  const handleVerifyOtp = async () => {
    const expectedOtp = otpType === "pickup" ? delivery.pickup_otp : delivery.delivery_otp;

    if (!expectedOtp) {
      setOtpError("OTP not found. Please contact support.");
      return;
    }

    if (otpInput.trim() !== expectedOtp.trim()) {
      setOtpError("Invalid OTP. Please try again.");
      return;
    }

    setIsUpdating(true);
    try {
      if (otpType === "pickup") {
        await updateDeliveryStatus(deliveryId, "in_transit", { pickup_status: "picked" });
        onStatusUpdate({ delivery_status: "in_transit", pickup_status: "picked" });
        toast.success("Pickup verified! Now navigate to the delivery location.");
      } else {
        await updateDeliveryStatus(deliveryId, "delivered");
        onStatusUpdate({ delivery_status: "delivered" });
        toast.success("🎉 Delivery completed! Thank you for making a difference.");
      }
      setShowOtpDialog(false);
      setOtpInput("");
      setOtpError("");
    } catch (err) {
      toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Active Delivery
              </CardTitle>
              <CardDescription>
                <span className="capitalize">
                  {delivery.donation?.food_type?.replace("-", " ") || "Food"}
                </span>{" "}
                — {delivery.donation?.quantity || 0} {delivery.donation?.quantity_unit || "items"}
              </CardDescription>
            </div>
            <Badge className="bg-primary/10 text-primary border border-primary/20 font-semibold">
              {statusSteps[currentStatusIndex]?.label || "In Progress"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Live Tracking & ETA Section for Donors/NGOs */}
          {userRole !== "volunteer" && delivery.delivery_status === "in_transit" && (
            <div className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 to-background shadow-sm">
              <div className="flex items-center justify-between p-4 border-b border-primary/10">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-primary/40" />
                    <div className="relative h-3 w-3 rounded-full bg-primary" />
                  </div>
                  <span className="text-xs font-bold text-primary uppercase tracking-widest">Live Tracking</span>
                </div>
                {delivery.eta && (
                  <div className="flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-xs font-bold text-primary shadow-sm border border-primary/10">
                    <Clock className="h-3.5 w-3.5" />
                    ETA: {delivery.eta}
                  </div>
                )}
              </div>

              {/* Map Placeholder */}
              <div className="relative h-40 w-full bg-muted/30">
                <div 
                  className="absolute inset-0 opacity-40 grayscale-[0.5] hover:grayscale-0 transition-all duration-700 bg-cover bg-center" 
                  style={{ backgroundImage: "url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/77.5946,12.9716,13/600x300?access_token=pk.eyJ1IjoiYm9vdHN0cmFwIiwiYSI6ImNrN2x6M2YwdzAxbTMzZnBicHh5eHh4eHgifQ')" }}
                />
                
                {/* Route Line Simulation */}
                <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M 20 80 Q 50 20 80 80" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/30" strokeDasharray="4 2" />
                </svg>

                <div className="relative z-10 flex h-full items-center justify-center">
                  <div className="flex flex-col items-center">
                    <div className="group relative">
                      <div className="absolute -inset-4 animate-pulse rounded-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative h-10 w-10 bg-primary rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary),0.4)] border-2 border-background">
                        <Truck className="h-5 w-5 text-primary-foreground" />
                      </div>
                    </div>
                    <div className="mt-3 transform transition-transform hover:scale-105">
                      <div className="px-4 py-1.5 bg-background/95 backdrop-blur-md rounded-full text-[11px] font-bold border border-primary/20 shadow-lg flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-primary" />
                        {delivery.current_location?.address || "In Transit"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-3 bg-muted/5 flex items-center justify-center gap-4 text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                <span>Updated just now</span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                <span>Secure transport active</span>
              </div>
            </div>
          )}

          {/* Driver Details for non-volunteers */}
          {userRole !== "volunteer" && delivery.volunteer_id && (
            <div className="rounded-xl border border-border p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Driver Details</span>
                </div>
                <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {delivery.volunteer_name?.charAt(0) || "V"}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{delivery.volunteer_name || "Volunteer"}</p>
                    <p className="text-xs text-muted-foreground">{delivery.volunteer_phone || "N/A"}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="h-9 w-9 p-0 rounded-full border-primary/20 text-primary hover:bg-primary/5">
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Progress Steps */}
          <div className="relative flex items-center justify-between">
            {/* connecting line */}
            <div className="absolute left-0 right-0 top-5 h-0.5 bg-border" aria-hidden />
            <div
              className="absolute left-0 top-5 h-0.5 bg-primary transition-all duration-500"
              style={{
                width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%`,
              }}
              aria-hidden
            />

            {statusSteps.map((step, index) => {
              const isCompleted = index < currentStatusIndex;
              const isCurrent = index === currentStatusIndex;

              return (
                <div key={step.status} className="relative flex flex-col items-center gap-2 z-10">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${isCompleted
                        ? "bg-primary border-primary text-primary-foreground"
                        : isCurrent
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-background border-border text-muted-foreground"
                      }`}
                  >
                    {stepIcons[step.status]}
                  </div>
                  <span
                    className={`text-xs font-medium whitespace-nowrap ${isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"
                      }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Pickup Location Card */}
          <div
            className={`rounded-xl border p-4 space-y-3 transition-colors ${delivery.pickup_status === "picked"
                ? "border-primary/30 bg-primary/5"
                : "border-border"
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Store className="h-4 w-4 text-primary" />
                </div>
                <span className="font-semibold text-foreground">Pickup Location</span>
              </div>
              {delivery.pickup_status === "picked" && (
                <Badge className="bg-primary/10 text-primary border border-primary/20">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Picked Up
                </Badge>
              )}
            </div>

            <div className="ml-10 space-y-1.5">
              <p className="font-semibold text-foreground">
                {delivery.donation?.donor_name || "Donor"}
              </p>
              {delivery.donation?.location?.address && (
                <p className="text-sm text-muted-foreground flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  {delivery.donation.location.address}
                </p>
              )}
            </div>

            {/* Navigate to pickup button */}
            {delivery.pickup_status !== "picked" && delivery.donation?.location?.lat && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 gap-2 text-primary border-primary/30 hover:bg-primary/5"
                onClick={() =>
                  openGoogleMaps(
                    delivery.donation.location.lat,
                    delivery.donation.location.lng,
                    delivery.donation.location.address
                  )
                }
              >
                <Navigation className="h-4 w-4" />
                Navigate to Pickup
                <ExternalLink className="h-3.5 w-3.5 ml-auto opacity-60" />
              </Button>
            )}

            {/* Action buttons based on status - Only for Volunteers */}
            {userRole === "volunteer" && (
              <>
                {delivery.delivery_status === "assigned" && (
                  <Button
                    className="w-full mt-2"
                    onClick={handleArrivedAtPickup}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Store className="mr-2 h-4 w-4" />
                    )}
                    I&apos;ve Arrived at Pickup
                  </Button>
                )}

                {delivery.delivery_status === "pickup" && delivery.pickup_status === "arrived" && (
                  <Button
                    className="w-full mt-2"
                    onClick={() => handleStartOtpVerification("pickup")}
                    disabled={isUpdating}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Verify Pickup OTP
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Delivery Location Card */}
          <div
            className={`rounded-xl border p-4 space-y-3 transition-colors ${delivery.delivery_status === "delivered"
                ? "border-primary/30 bg-primary/5"
                : "border-border"
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
                  <Building2 className="h-4 w-4 text-accent" />
                </div>
                <span className="font-semibold text-foreground">Delivery Location</span>
              </div>
              {delivery.delivery_status === "delivered" && (
                <Badge className="bg-primary/10 text-primary border border-primary/20">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Delivered
                </Badge>
              )}
            </div>

            <div className="ml-10 space-y-1.5">
              <p className="font-semibold text-foreground">
                {delivery.request?.ngo_name || "NGO"}
              </p>
              {delivery.request?.location?.address && (
                <p className="text-sm text-muted-foreground flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  {delivery.request.location.address}
                </p>
              )}
            </div>

            {/* Navigate to delivery button */}
            {delivery.delivery_status === "in_transit" && delivery.request?.location?.lat && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2 gap-2 text-accent border-accent/30 hover:bg-accent/5"
                onClick={() =>
                  openGoogleMaps(
                    delivery.request.location.lat,
                    delivery.request.location.lng,
                    delivery.request.location.address
                  )
                }
              >
                <Navigation className="h-4 w-4" />
                Navigate to Delivery
                <ExternalLink className="h-3.5 w-3.5 ml-auto opacity-60" />
              </Button>
            )}

            {userRole === "volunteer" && delivery.delivery_status === "in_transit" && (
              <Button
                className="w-full mt-2"
                onClick={() => handleStartOtpVerification("delivery")}
                disabled={isUpdating}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Verify Delivery OTP
              </Button>
            )}
          </div>

          {/* Completion Message */}
          {delivery.delivery_status === "delivered" && (
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-5 text-center">
              <CheckCircle className="mx-auto h-10 w-10 text-primary mb-3" />
              <p className="text-lg font-bold text-primary">Delivery Completed!</p>
              <p className="text-sm text-primary/70 mt-1">
                Thank you for making a difference today.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* OTP Verification Dialog */}
      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {otpType === "pickup" ? "Pickup" : "Delivery"} OTP Verification
            </DialogTitle>
            <DialogDescription>
              Enter the 6-digit OTP provided by the{" "}
              {otpType === "pickup" ? "donor" : "NGO representative"} to confirm.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">OTP Code</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter 6-digit OTP"
                value={otpInput}
                onChange={(e) => {
                  setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setOtpError("");
                }}
                maxLength={6}
                className="text-center text-2xl tracking-[0.5em] font-mono"
                autoComplete="one-time-code"
              />
              {otpError && <p className="text-sm text-destructive">{otpError}</p>}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Ask the {otpType === "pickup" ? "donor" : "NGO staff"} to show their OTP from the अन्नSetu app.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOtpDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleVerifyOtp}
              disabled={otpInput.length !== 6 || isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Verify OTP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
