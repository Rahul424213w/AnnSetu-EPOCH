import type { Timestamp } from "firebase/firestore";

export type FoodType = "veg" | "non-veg" | "packaged";
export type UrgencyLevel = "low" | "medium" | "high";
export type DonationStatus = "active" | "matched" | "picked" | "delivered" | "expired";
export type RequestStatus = "active" | "matched" | "fulfilled" | "cancelled";
export type DeliveryStatus = "pending" | "assigned" | "pickup" | "in_transit" | "delivered";
export type PickupStatus = "pending" | "arrived" | "picked";

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface Donation {
  id?: string;
  donor_id: string;
  donor_name?: string;
  food_type: FoodType;
  quantity: number;
  quantity_unit: "kg" | "meals";
  expiry_time: Timestamp;
  pickup_window_start: Timestamp;
  pickup_window_end: Timestamp;
  packaging_condition: "good" | "fair" | "poor";
  location: Location;
  image_url?: string;
  status: DonationStatus;
  created_at: Timestamp;
}

export interface NGORequest {
  id?: string;
  ngo_id: string;
  ngo_name?: string;
  food_type: FoodType;
  quantity: number;
  people_count: number;
  urgency: UrgencyLevel;
  time_window_start: Timestamp;
  time_window_end: Timestamp;
  storage_capability: boolean;
  location: Location;
  status: RequestStatus;
  created_at: Timestamp;
}

export interface Match {
  id?: string;
  donation_id: string;
  request_id: string;
  score: number;
  status: "pending" | "accepted" | "rejected" | "completed";
  created_at: Timestamp;
}

export interface Delivery {
  id?: string;
  match_id: string;
  volunteer_id?: string;
  volunteer_name?: string;
  volunteer_phone?: string;
  donation: Donation;
  request: NGORequest;
  pickup_status: PickupStatus;
  delivery_status: DeliveryStatus;
  pickup_otp?: string;
  delivery_otp?: string;
  pickup_photo_url?: string;
  delivery_photo_url?: string;
  distance?: number;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface DonationFund {
  id?: string;
  donor_id: string;
  amount: number;
  type: "sponsor_meals" | "fund_delivery" | "general";
  created_at: Timestamp;
}

export interface ImpactStats {
  meals_saved: number;
  food_waste_reduced_kg: number;
  active_deliveries: number;
  ngos_served: number;
  total_donations: number;
  total_deliveries: number;
}
