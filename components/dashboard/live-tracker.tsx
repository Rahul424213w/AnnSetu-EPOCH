"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Truck, 
  ChevronRight, 
  Package, 
  Navigation,
  Info,
  Loader2
} from "lucide-react";
import dynamic from "next/dynamic";
import type { Delivery } from "@/lib/types";
import "leaflet/dist/leaflet.css";

// Dynamic import for Leaflet to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted animate-pulse flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary/30" /></div>
});
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

export function LiveTracker({ delivery, userRole = "ngo" }: { delivery: Delivery, userRole?: "ngo" | "donor" | "volunteer" }) {
  const [L, setL] = useState<any>(null);

  useEffect(() => {
    import("leaflet").then((leaflet) => {
      // Fix marker icon issues
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      setL(leaflet);
    });
  }, []);

  const driverLocation = delivery.current_location || { lat: 12.9716, lng: 77.5946, address: "In Transit" };
  const destinationLocation = userRole === "donor" 
    ? (delivery.donation?.location || { lat: 12.9716, lng: 77.5946 })
    : (delivery.request?.location || { lat: 12.9500, lng: 77.6000 });

  const getStatusText = () => {
    if (userRole === "donor") {
      switch (delivery.delivery_status) {
        case "assigned": return "Volunteer assigned";
        case "pickup": return "Arriving for pickup";
        case "in_transit": return "Heading to NGO";
        case "delivered": return "Delivered";
        default: return "Processing";
      }
    }
    
    switch (delivery.delivery_status) {
      case "assigned": return "Volunteer assigned";
      case "pickup": return "Picking up food";
      case "in_transit": return "On the way to you";
      case "delivered": return "Delivered";
      default: return "Processing";
    }
  };

  const getDestinationLabel = () => {
    if (userRole === "donor") return "Pickup Location";
    return "Your Center";
  };

  return (
    <Card className="overflow-hidden border-none shadow-2xl bg-background/50 backdrop-blur-xl">
      <CardContent className="p-0">
        {/* Header - ETA & Status */}
        <div className="bg-primary p-6 text-primary-foreground">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest opacity-80">Live Tracking</span>
            </div>
            <Badge variant="outline" className="text-white border-white/30 bg-white/10 backdrop-blur-md">
              #{delivery.id?.slice(-6).toUpperCase()}
            </Badge>
          </div>
          
          <div className="flex items-end justify-between">
            <div>
              <p className="text-4xl font-black tracking-tighter mb-1">
                {delivery.eta || "8 mins"}
              </p>
              <p className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {getStatusText()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-70 font-medium mb-1">
                {userRole === "donor" ? (delivery.delivery_status === "in_transit" ? "Heading to" : "Arriving at") : "Arriving at"}
              </p>
              <p className="text-sm font-bold truncate max-w-[150px]">
                {userRole === "donor" 
                  ? (delivery.delivery_status === "in_transit" ? (delivery.request?.ngo_name || "NGO") : "Your Place")
                  : (delivery.request?.location?.address?.split(',')[0] || "Your Center")}
              </p>
            </div>
          </div>

          {/* Custom Progress Bar */}
          <div className="mt-6 relative h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-white transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.8)]"
              style={{ 
                width: delivery.delivery_status === "assigned" ? "25%" : 
                       delivery.delivery_status === "pickup" ? "50%" : 
                       delivery.delivery_status === "in_transit" ? "75%" : "100%" 
              }}
            />
          </div>
        </div>

        {/* Map View */}
        <div className="relative h-[300px] w-full bg-muted">
          {L && (
            <MapContainer 
              center={[driverLocation.lat, driverLocation.lng]} 
              zoom={14} 
              scrollWheelZoom={false}
              className="h-full w-full z-0"
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[driverLocation.lat, driverLocation.lng]}>
                <Popup>
                  Driver is here: {driverLocation.address}
                </Popup>
              </Marker>
              <Marker position={[destinationLocation.lat, destinationLocation.lng]}>
                <Popup>{getDestinationLabel()}</Popup>
              </Marker>
            </MapContainer>
          )}
          
          {/* Map Overlay Buttons */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <Button size="icon" variant="secondary" className="rounded-full shadow-lg bg-background/90 backdrop-blur-md">
              <Navigation className="h-4 w-4 text-primary" />
            </Button>
          </div>

          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="bg-background/95 backdrop-blur-md p-3 rounded-xl border border-border shadow-xl flex items-center gap-3">
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Currently at</p>
                <p className="text-xs font-bold text-foreground truncate">{driverLocation.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Driver & Order Details */}
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-14 w-14 rounded-full bg-muted border-2 border-primary flex items-center justify-center overflow-hidden">
                  <span className="text-xl font-bold text-primary">{delivery.volunteer_name?.charAt(0) || "V"}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                  <Badge className="h-2 w-2 p-0 bg-white rounded-full" />
                </div>
              </div>
              <div>
                <p className="text-lg font-black text-foreground">{delivery.volunteer_name || "Volunteer"}</p>
                <div className="flex items-center gap-1.5">
                  <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none">
                    ⭐ 4.9
                  </Badge>
                  <span className="text-xs text-muted-foreground font-medium">• 500+ deliveries</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="outline" className="rounded-full h-11 w-11 border-primary/20 text-primary hover:bg-primary/5 shadow-sm">
                <MessageSquare className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="default" className="rounded-full h-11 w-11 shadow-lg shadow-primary/20" asChild>
                <a href={`tel:${delivery.volunteer_phone}`}>
                  <Phone className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>

          <div className="h-px bg-border/60" />

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                <Package className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {userRole === "donor" ? "Being delivered to" : "Your Package from"}
                </p>
                <p className="text-sm font-bold">
                  {userRole === "donor" ? (delivery.request?.ngo_name || "NGO") : (delivery.donation?.donor_name || "Sunshine Bakery")}
                </p>
              </div>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 font-bold p-0">
                View Details <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            <div className="bg-muted/30 rounded-xl p-4 flex items-start gap-3">
              <Info className="h-5 w-5 text-primary mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-bold text-foreground">Note:</span> 
                {userRole === "donor" 
                  ? " Please ensure the food is ready for pickup to help the volunteer stay on schedule."
                  : " Please be ready with your delivery OTP to confirm receipt when the volunteer arrives."}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
