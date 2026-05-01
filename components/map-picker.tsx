"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Location } from "@/lib/types";

interface MapPickerProps {
  value?: Location;
  onChange: (location: Location) => void;
}

export function MapPicker({ value, onChange }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [address, setAddress] = useState(value?.address || "");
  const [map, setMap] = useState<L.Map | null>(null);
  const [marker, setMarker] = useState<L.Marker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const defaultLocation = { lat: 28.6139, lng: 77.2090 };

  useEffect(() => {
    let isMounted = true;
    let cleanupFn: (() => void) | null = null;

    // Dynamically import Leaflet to avoid SSR issues
    const loadMap = async () => {
      if (typeof window === "undefined" || !mapRef.current) return;

      // If map is already initialized on this ref, don't do it again
      if (mapInstanceRef.current) return;

      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (!isMounted || !mapRef.current) return;

      // Check if the DOM element already has a leaflet instance (extra safety)
      if ((mapRef.current as any)._leaflet_id) return;

      // Fix default marker icon issue with correct type assertion
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const initialLocation = value || defaultLocation;

      const mapInstance = L.map(mapRef.current, {
        preferCanvas: true, // Use Canvas renderer for better performance
      }).setView(
        [initialLocation.lat, initialLocation.lng],
        13
      );

      const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapInstance);

      const markerInstance = L.marker([initialLocation.lat, initialLocation.lng], {
        draggable: true,
      }).addTo(mapInstance);

      // Event handlers with cleanup
      const handleDragEnd = () => {
        const pos = markerInstance.getLatLng();
        onChange({ lat: pos.lat, lng: pos.lng, address });
      };

      const handleClick = (e: L.LeafletMouseEvent) => {
        markerInstance.setLatLng(e.latlng);
        onChange({ lat: e.latlng.lat, lng: e.latlng.lng, address });
      };

      markerInstance.on("dragend", handleDragEnd);
      mapInstance.on("click", handleClick);

      // Cleanup function for event listeners
      cleanupFn = () => {
        markerInstance.off("dragend", handleDragEnd);
        mapInstance.off("click", handleClick);
      };

      if (isMounted) {
        mapInstanceRef.current = mapInstance;
        setMap(mapInstance);
        setMarker(markerInstance);
        setIsLoaded(true);
      } else {
        cleanupFn?.();
        tileLayer.remove();
        markerInstance.remove();
        mapInstance.remove();
      }
    };

    loadMap();

    return () => {
      isMounted = false;
      cleanupFn?.();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          if (map && marker) {
            map.setView([latitude, longitude], 15);
            marker.setLatLng([latitude, longitude]);
          }
          onChange({ lat: latitude, lng: longitude, address });
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your location. Please select on the map.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Label htmlFor="address" className="text-foreground">Address (Optional)</Label>
          <Input
            id="address"
            placeholder="Enter address or select on map"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              if (value) {
                onChange({ ...value, address: e.target.value });
              }
            }}
            className="bg-input border-border"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleGetCurrentLocation}
          className="mt-6"
        >
          <MapPin className="mr-2 h-4 w-4" />
          Use My Location
        </Button>
      </div>

      <div className="relative">
        <div
          ref={mapRef}
          className="h-[300px] w-full rounded-lg border border-border overflow-hidden"
          style={{ background: "#f0f0f0" }}
        />
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        )}
      </div>

      {value && (
        <p className="text-sm text-muted-foreground">
          Selected: {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}
