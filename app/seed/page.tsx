"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Database, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  doc,
  setDoc,
  addDoc,
  collection,
  Timestamp,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { generateOTP } from "@/lib/firestore";

// ─── Seed Data ──────────────────────────────────────────────────────────────────

const DEMO_USERS = [
  {
    uid: "demo-donor",
    email: "demo-donor@annsetu.org",
    name: "Green Cafe",
    role: "donor",
    phone: "+91 9876543210",
    location: { lat: 12.9817, lng: 77.5816 },
  },
  {
    uid: "demo-donor-2",
    email: "demo-donor2@annsetu.org",
    name: "Corner House Ice Cream",
    role: "donor",
    phone: "+91 9876543215",
    location: { lat: 12.9783, lng: 77.5900 },
  },
  {
    uid: "demo-donor-3",
    email: "demo-donor3@annsetu.org",
    name: "The Rameshwaram Cafe",
    role: "donor",
    phone: "+91 9876543216",
    location: { lat: 12.9650, lng: 77.6050 },
  },
  {
    uid: "demo-ngo",
    email: "demo-ngo@annsetu.org",
    name: "Hope Foundation",
    role: "ngo",
    phone: "+91 9876543211",
    location: { lat: 12.9352, lng: 77.6245 },
  },
  {
    uid: "demo-ngo-2",
    email: "demo-ngo2@annsetu.org",
    name: "Akshaya Patra Foundation",
    role: "ngo",
    phone: "+91 9876543217",
    location: { lat: 12.9450, lng: 77.5800 },
  },
  {
    uid: "demo-volunteer",
    email: "demo-volunteer@annsetu.org",
    name: "Rahul Kumar",
    role: "volunteer",
    phone: "+91 9876543212",
    location: { lat: 12.9500, lng: 77.6000 },
  },
  {
    uid: "demo-donor-4",
    email: "demo-donor4@annsetu.org",
    name: "Bakingo",
    role: "donor",
    phone: "+91 9876543218",
    location: { lat: 12.9200, lng: 77.6500 },
  },
  {
    uid: "demo-ngo-3",
    email: "demo-ngo3@annsetu.org",
    name: "Goonj Bangalore",
    role: "ngo",
    phone: "+91 9876543219",
    location: { lat: 12.9100, lng: 77.6300 },
  },
  {
    uid: "demo-volunteer-2",
    email: "demo-volunteer2@annsetu.org",
    name: "Priya Sharma",
    role: "volunteer",
    phone: "+91 9876543220",
    location: { lat: 12.9150, lng: 77.6400 },
  },
];

function hoursFromNow(h: number) {
  return Timestamp.fromDate(new Date(Date.now() + h * 60 * 60 * 1000));
}
function hoursAgo(h: number) {
  return Timestamp.fromDate(new Date(Date.now() - h * 60 * 60 * 1000));
}

const SEED_DONATIONS = [
  {
    donor_id: "demo-donor",
    donor_name: "Green Cafe",
    food_type: "veg",
    quantity: 50,
    quantity_unit: "meals",
    expiry_time: hoursFromNow(6),
    pickup_window_start: hoursFromNow(0.5),
    pickup_window_end: hoursFromNow(4),
    packaging_condition: "excellent",
    location: { lat: 12.9817, lng: 77.5816, address: "Race Course Road, Bangalore" },
    status: "active",
    created_at: hoursAgo(1),
  },
  {
    donor_id: "demo-donor-2",
    donor_name: "Corner House Ice Cream",
    food_type: "veg",
    quantity: 15,
    quantity_unit: "kg",
    expiry_time: hoursFromNow(4),
    pickup_window_start: hoursFromNow(0),
    pickup_window_end: hoursFromNow(2),
    packaging_condition: "good",
    location: { lat: 12.9783, lng: 77.5900, address: "Residency Road, Bangalore" },
    status: "active",
    created_at: hoursAgo(0.5),
  },
  {
    donor_id: "demo-donor-3",
    donor_name: "The Rameshwaram Cafe",
    food_type: "veg",
    quantity: 120,
    quantity_unit: "meals",
    expiry_time: hoursFromNow(3),
    pickup_window_start: hoursFromNow(0),
    pickup_window_end: hoursFromNow(2),
    packaging_condition: "good",
    location: { lat: 12.9650, lng: 77.6050, address: "Indiranagar, Bangalore" },
    status: "matched",
    created_at: hoursAgo(2),
  },
  {
    donor_id: "demo-donor",
    donor_name: "Green Cafe",
    food_type: "non-veg",
    quantity: 30,
    quantity_unit: "meals",
    expiry_time: hoursFromNow(5),
    pickup_window_start: hoursFromNow(0),
    pickup_window_end: hoursFromNow(3),
    packaging_condition: "good",
    location: { lat: 12.9817, lng: 77.5816, address: "Race Course Road, Bangalore" },
    status: "matched",
    created_at: hoursAgo(0.8),
  },
  {
    donor_id: "demo-donor-4",
    donor_name: "Bakingo",
    food_type: "packaged",
    quantity: 25,
    quantity_unit: "items",
    expiry_time: hoursFromNow(24),
    pickup_window_start: hoursFromNow(1),
    pickup_window_end: hoursFromNow(6),
    packaging_condition: "excellent",
    location: { lat: 12.9200, lng: 77.6500, address: "HSR Layout, Bangalore" },
    status: "matched",
    created_at: hoursAgo(1.5),
  },
  {
    donor_id: "demo-donor",
    donor_name: "Green Cafe",
    food_type: "veg",
    quantity: 200,
    quantity_unit: "meals",
    expiry_time: hoursAgo(1),
    pickup_window_start: hoursAgo(5),
    pickup_window_end: hoursAgo(3),
    packaging_condition: "excellent",
    location: { lat: 12.9817, lng: 77.5816, address: "Race Course Road, Bangalore" },
    status: "delivered",
    created_at: hoursAgo(24),
  },
  {
    donor_id: "demo-donor",
    donor_name: "Green Cafe",
    food_type: "non-veg",
    quantity: 50,
    quantity_unit: "meals",
    expiry_time: hoursAgo(2),
    pickup_window_start: hoursAgo(48),
    pickup_window_end: hoursAgo(46),
    packaging_condition: "good",
    location: { lat: 12.9817, lng: 77.5816, address: "Race Course Road, Bangalore" },
    status: "delivered",
    created_at: hoursAgo(49),
  },
  {
    donor_id: "demo-donor",
    donor_name: "Green Cafe",
    food_type: "veg",
    quantity: 40,
    quantity_unit: "meals",
    expiry_time: hoursFromNow(8),
    pickup_window_start: hoursFromNow(2),
    pickup_window_end: hoursFromNow(5),
    packaging_condition: "good",
    location: { lat: 12.9817, lng: 77.5816, address: "Race Course Road, Bangalore" },
    status: "matched",
    created_at: hoursAgo(0.5),
  },
  {
    donor_id: "demo-donor-2",
    donor_name: "Corner House Ice Cream",
    food_type: "packaged",
    quantity: 10,
    quantity_unit: "kg",
    expiry_time: hoursFromNow(12),
    pickup_window_start: hoursFromNow(1),
    pickup_window_end: hoursFromNow(3),
    packaging_condition: "excellent",
    location: { lat: 12.9783, lng: 77.5900, address: "Residency Road, Bangalore" },
    status: "matched",
    created_at: hoursAgo(1),
  },
  {
    donor_id: "demo-donor-5",
    donor_name: "MTR",
    food_type: "veg",
    quantity: 80,
    quantity_unit: "meals",
    expiry_time: hoursFromNow(4),
    pickup_window_start: hoursFromNow(0),
    pickup_window_end: hoursFromNow(2),
    packaging_condition: "good",
    location: { lat: 12.9538, lng: 77.5871, address: "Lalbagh Road, Bangalore" },
    status: "active",
    created_at: hoursAgo(0.2),
  },
  {
    donor_id: "demo-donor-6",
    donor_name: "Meghana Foods",
    food_type: "non-veg",
    quantity: 150,
    quantity_unit: "meals",
    expiry_time: hoursFromNow(6),
    pickup_window_start: hoursFromNow(1),
    pickup_window_end: hoursFromNow(4),
    packaging_condition: "excellent",
    location: { lat: 12.9344, lng: 77.6115, address: "Koramangala 5th Block, Bangalore" },
    status: "matched",
    created_at: hoursAgo(1.2),
  },
  {
    donor_id: "demo-donor-7",
    donor_name: "Empire Restaurant",
    food_type: "non-veg",
    quantity: 100,
    quantity_unit: "meals",
    expiry_time: hoursFromNow(8),
    pickup_window_start: hoursFromNow(2),
    pickup_window_end: hoursFromNow(6),
    packaging_condition: "good",
    location: { lat: 12.9719, lng: 77.6012, address: "Church Street, Bangalore" },
    status: "active",
    created_at: hoursAgo(0.5),
  },
];

const SEED_REQUESTS = [
  {
    ngo_id: "demo-ngo",
    ngo_name: "Hope Foundation",
    food_type: "veg",
    quantity: 100,
    people_count: 200,
    urgency: "high",
    time_window_start: hoursFromNow(0),
    time_window_end: hoursFromNow(6),
    storage_capability: true,
    location: { lat: 12.9352, lng: 77.6245, address: "Koramangala 4th Block, Bangalore" },
    status: "active",
    created_at: hoursAgo(1),
  },
  {
    ngo_id: "demo-ngo-2",
    ngo_name: "Akshaya Patra Foundation",
    food_type: "veg",
    quantity: 500,
    people_count: 1000,
    urgency: "medium",
    time_window_start: hoursFromNow(1),
    time_window_end: hoursFromNow(8),
    storage_capability: true,
    location: { lat: 12.9450, lng: 77.5800, address: "Jayanagar 4th Block, Bangalore" },
    status: "active",
    created_at: hoursAgo(2),
  },
  {
    ngo_id: "demo-ngo",
    ngo_name: "Hope Foundation",
    food_type: "veg",
    quantity: 120,
    people_count: 240,
    urgency: "high",
    time_window_start: hoursFromNow(0),
    time_window_end: hoursFromNow(10),
    storage_capability: false,
    location: { lat: 12.9352, lng: 77.6245, address: "Koramangala 4th Block, Bangalore" },
    status: "matched",
    created_at: hoursAgo(3),
  },
  {
    ngo_id: "demo-ngo-3",
    ngo_name: "Goonj Bangalore",
    food_type: "packaged",
    quantity: 50,
    people_count: 100,
    urgency: "low",
    time_window_start: hoursFromNow(2),
    time_window_end: hoursFromNow(12),
    storage_capability: true,
    location: { lat: 12.9100, lng: 77.6300, address: "Sarjapur Main Road, Bangalore" },
    status: "matched",
    created_at: hoursAgo(1.5),
  },
  {
    ngo_id: "demo-ngo",
    ngo_name: "Hope Foundation",
    food_type: "non-veg",
    quantity: 30,
    people_count: 60,
    urgency: "high",
    time_window_start: hoursFromNow(0),
    time_window_end: hoursFromNow(4),
    storage_capability: false,
    location: { lat: 12.9352, lng: 77.6245, address: "Koramangala 4th Block, Bangalore" },
    status: "matched",
    created_at: hoursAgo(0.9),
  },
  {
    ngo_id: "demo-ngo",
    ngo_name: "Hope Foundation",
    food_type: "veg",
    quantity: 200,
    people_count: 400,
    urgency: "medium",
    time_window_start: hoursAgo(6),
    time_window_end: hoursAgo(2),
    storage_capability: true,
    location: { lat: 12.9352, lng: 77.6245, address: "Koramangala 4th Block, Bangalore" },
    status: "completed",
    created_at: hoursAgo(24),
  },
  {
    ngo_id: "demo-ngo",
    ngo_name: "Hope Foundation",
    food_type: "non-veg",
    quantity: 50,
    people_count: 100,
    urgency: "high",
    time_window_start: hoursAgo(50),
    time_window_end: hoursAgo(46),
    storage_capability: false,
    location: { lat: 12.9352, lng: 77.6245, address: "Koramangala 4th Block, Bangalore" },
    status: "completed",
    created_at: hoursAgo(49),
  },
  {
    ngo_id: "demo-ngo",
    ngo_name: "Hope Foundation",
    food_type: "veg",
    quantity: 40,
    people_count: 80,
    urgency: "medium",
    time_window_start: hoursFromNow(1),
    time_window_end: hoursFromNow(6),
    storage_capability: true,
    location: { lat: 12.9352, lng: 77.6245, address: "Koramangala 4th Block, Bangalore" },
    status: "matched",
    created_at: hoursAgo(1),
  },
  {
    ngo_id: "demo-ngo-2",
    ngo_name: "Akshaya Patra Foundation",
    food_type: "packaged",
    quantity: 20,
    people_count: 50,
    urgency: "low",
    time_window_start: hoursFromNow(0),
    time_window_end: hoursFromNow(5),
    storage_capability: true,
    location: { lat: 12.9450, lng: 77.5800, address: "Jayanagar 4th Block, Bangalore" },
    status: "matched",
    created_at: hoursAgo(1.5),
  },
  {
    ngo_id: "demo-ngo-3",
    ngo_name: "Goonj Bangalore",
    food_type: "veg",
    quantity: 100,
    people_count: 200,
    urgency: "high",
    time_window_start: hoursFromNow(0),
    time_window_end: hoursFromNow(4),
    storage_capability: false,
    location: { lat: 12.9100, lng: 77.6300, address: "Sarjapur Main Road, Bangalore" },
    status: "active",
    created_at: hoursAgo(0.5),
  },
  {
    ngo_id: "demo-ngo",
    ngo_name: "Hope Foundation",
    food_type: "non-veg",
    quantity: 150,
    people_count: 300,
    urgency: "high",
    time_window_start: hoursFromNow(0),
    time_window_end: hoursFromNow(5),
    storage_capability: false,
    location: { lat: 12.9352, lng: 77.6245, address: "Koramangala 4th Block, Bangalore" },
    status: "matched",
    created_at: hoursAgo(2),
  },
  {
    ngo_id: "demo-ngo-2",
    ngo_name: "Akshaya Patra Foundation",
    food_type: "non-veg",
    quantity: 80,
    people_count: 160,
    urgency: "medium",
    time_window_start: hoursFromNow(1),
    time_window_end: hoursFromNow(6),
    storage_capability: true,
    location: { lat: 12.9450, lng: 77.5800, address: "Jayanagar 4th Block, Bangalore" },
    status: "active",
    created_at: hoursAgo(1),
  },
];

const GLOBAL_STATS = {
  meals_saved: 12_847,
  food_waste_reduced_kg: 3_421,
  active_deliveries: 24,
  ngos_served: 156,
  total_donations: 1_240,
  total_deliveries: 890,
};

// ─── Seed Script Component ──────────────────────────────────────────────────────

export default function SeedPage() {
  const [status, setStatus] = useState<"idle" | "seeding" | "done" | "error">("idle");
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog((prev) => [...prev, msg]);

  const clearCollection = async (name: string) => {
    const snapshot = await getDocs(collection(db, name));
    const promises = snapshot.docs.map(d => deleteDoc(d.ref));
    await Promise.all(promises);
  };

  const runSeed = async () => {
    setStatus("seeding");
    setLog([]);

    try {
      // 0. Clear existing data
      addLog("🧹 Clearing existing demo data...");
      await clearCollection("donations");
      await clearCollection("requests");
      await clearCollection("matches");
      await clearCollection("deliveries");

      // 1. Seed users
      addLog("📦 Seeding demo users...");
      for (const user of DEMO_USERS) {
        await setDoc(doc(db, "users", user.uid), user, { merge: true });
      }
      addLog(`✅ ${DEMO_USERS.length} users seeded`);

      // 2. Seed global stats
      addLog("📊 Seeding global impact stats...");
      await setDoc(doc(db, "stats", "global"), GLOBAL_STATS, { merge: true });
      addLog("✅ Global stats seeded");

      // 3. Seed donations
      addLog("🍲 Seeding donations...");
      const donationIds: string[] = [];
      for (const d of SEED_DONATIONS) {
        const ref = await addDoc(collection(db, "donations"), d);
        donationIds.push(ref.id);
      }
      addLog(`✅ ${SEED_DONATIONS.length} donations seeded`);

      // 4. Seed requests
      addLog("📋 Seeding NGO requests...");
      const requestIds: string[] = [];
      for (const r of SEED_REQUESTS) {
        const ref = await addDoc(collection(db, "requests"), r);
        requestIds.push(ref.id);
      }
      addLog(`✅ ${SEED_REQUESTS.length} requests seeded`);

      // 5. Create matches
      addLog("🔗 Creating matches...");
      const match1 = await addDoc(collection(db, "matches"), {
        donation_id: donationIds[2],
        request_id: requestIds[2],
        score: 92,
        ml_score: 0.94,
        ml_priority: "HIGH",
        status: "accepted",
        created_at: hoursAgo(2),
      });

      const match2 = await addDoc(collection(db, "matches"), {
        donation_id: donationIds[3],
        request_id: requestIds[4],
        score: 88,
        ml_score: 0.89,
        ml_priority: "HIGH",
        status: "accepted",
        created_at: hoursAgo(0.8),
      });

      const match3 = await addDoc(collection(db, "matches"), {
        donation_id: donationIds[4],
        request_id: requestIds[3],
        score: 75,
        ml_score: 0.72,
        ml_priority: "MEDIUM",
        status: "accepted",
        created_at: hoursAgo(1.5),
      });

      const match4 = await addDoc(collection(db, "matches"), {
        donation_id: donationIds[5],
        request_id: requestIds[5],
        score: 95,
        ml_score: 0.98,
        ml_priority: "HIGH",
        status: "completed",
        created_at: hoursAgo(24),
      });

      const match5 = await addDoc(collection(db, "matches"), {
        donation_id: donationIds[6],
        request_id: requestIds[6],
        score: 90,
        ml_score: 0.91,
        ml_priority: "HIGH",
        status: "completed",
        created_at: hoursAgo(49),
      });

      const match6 = await addDoc(collection(db, "matches"), {
        donation_id: donationIds[7],
        request_id: requestIds[7],
        score: 85,
        ml_score: 0.86,
        ml_priority: "MEDIUM",
        status: "accepted",
        created_at: hoursAgo(0.4),
      });

      const match7 = await addDoc(collection(db, "matches"), {
        donation_id: donationIds[8],
        request_id: requestIds[8],
        score: 91,
        ml_score: 0.93,
        ml_priority: "HIGH",
        status: "accepted",
        created_at: hoursAgo(0.9),
      });

      const match8 = await addDoc(collection(db, "matches"), {
        donation_id: donationIds[10],
        request_id: requestIds[10],
        score: 78,
        ml_score: 0.81,
        ml_priority: "MEDIUM",
        status: "accepted",
        created_at: hoursAgo(1.1),
      });
      addLog("✅ Matches seeded");

      // 6. Create deliveries
      addLog("🚚 Creating deliveries for tracking demo...");

      // Delivery 1: In Progress for NGO (Robin Hood Army)
      await addDoc(collection(db, "deliveries"), {
        match_id: match1.id,
        volunteer_id: "demo-volunteer-2",
        volunteer_name: "Priya Sharma",
        volunteer_phone: "+91 9876543220",
        donation: { ...SEED_DONATIONS[2], id: donationIds[2] },
        request: { ...SEED_REQUESTS[2], id: requestIds[2] },
        pickup_status: "picked",
        delivery_status: "in_transit",
        pickup_otp: "112233",
        delivery_otp: "445566",
        distance: 3.8,
        current_location: {
          lat: 12.9500,
          lng: 77.6100,
          address: "Domlur, Bangalore"
        },
        eta: "12 mins",
        created_at: hoursAgo(1.8),
        updated_at: hoursAgo(0.2),
      });

      // Delivery 2: In Progress for Donor (Taj West End)
      await addDoc(collection(db, "deliveries"), {
        match_id: match2.id,
        volunteer_id: "demo-volunteer",
        volunteer_name: "Rahul Kumar",
        volunteer_phone: "+91 9876543212",
        donation: { ...SEED_DONATIONS[3], id: donationIds[3] },
        request: { ...SEED_REQUESTS[4], id: requestIds[4] },
        pickup_status: "pending",
        delivery_status: "pickup",
        pickup_otp: generateOTP(),
        delivery_otp: generateOTP(),
        distance: 2.1,
        current_location: {
          lat: 12.9716,
          lng: 77.5946,
          address: "MG Road Metro Station, Bangalore"
        },
        eta: "6 mins",
        created_at: hoursAgo(0.7),
        updated_at: hoursAgo(0.1),
      });

      // Delivery 3: Pending Task
      await addDoc(collection(db, "deliveries"), {
        match_id: match3.id,
        donation: { ...SEED_DONATIONS[4], id: donationIds[4] },
        request: { ...SEED_REQUESTS[3], id: requestIds[3] },
        pickup_status: "pending",
        delivery_status: "pending",
        pickup_otp: generateOTP(),
        delivery_otp: generateOTP(),
        distance: 4.5,
        ml_score: 0.72,
        ml_priority: "MEDIUM",
        created_at: hoursAgo(1.4),
        updated_at: hoursAgo(1.4),
      });

      // Delivery 4: Delivered by demo-volunteer
      await addDoc(collection(db, "deliveries"), {
        match_id: match4.id,
        volunteer_id: "demo-volunteer",
        volunteer_name: "Rahul Kumar",
        volunteer_phone: "+91 9876543212",
        donation: { ...SEED_DONATIONS[5], id: donationIds[5] },
        request: { ...SEED_REQUESTS[5], id: requestIds[5] },
        pickup_status: "picked",
        delivery_status: "delivered",
        pickup_otp: "123456",
        delivery_otp: "654321",
        distance: 5.2,
        current_location: SEED_REQUESTS[5].location,
        eta: "0 mins",
        created_at: hoursAgo(23),
        updated_at: hoursAgo(22.5),
      });

      // Delivery 5: Delivered by demo-volunteer
      await addDoc(collection(db, "deliveries"), {
        match_id: match5.id,
        volunteer_id: "demo-volunteer",
        volunteer_name: "Rahul Kumar",
        volunteer_phone: "+91 9876543212",
        donation: { ...SEED_DONATIONS[6], id: donationIds[6] },
        request: { ...SEED_REQUESTS[6], id: requestIds[6] },
        pickup_status: "picked",
        delivery_status: "delivered",
        pickup_otp: "111111",
        delivery_otp: "222222",
        distance: 3.1,
        current_location: SEED_REQUESTS[6].location,
        eta: "0 mins",
        created_at: hoursAgo(48),
        updated_at: hoursAgo(47),
      });

      // Delivery 6: Pending Task (Available Delivery)
      await addDoc(collection(db, "deliveries"), {
        match_id: match6.id,
        donation: { ...SEED_DONATIONS[7], id: donationIds[7] },
        request: { ...SEED_REQUESTS[7], id: requestIds[7] },
        pickup_status: "pending",
        delivery_status: "pending",
        pickup_otp: generateOTP(),
        delivery_otp: generateOTP(),
        distance: 2.8,
        ml_score: 0.86,
        ml_priority: "MEDIUM",
        created_at: hoursAgo(0.3),
        updated_at: hoursAgo(0.3),
      });

      // Delivery 7: Pending Task (Available Delivery)
      await addDoc(collection(db, "deliveries"), {
        match_id: match7.id,
        donation: { ...SEED_DONATIONS[8], id: donationIds[8] },
        request: { ...SEED_REQUESTS[8], id: requestIds[8] },
        pickup_status: "pending",
        delivery_status: "pending",
        pickup_otp: generateOTP(),
        delivery_otp: generateOTP(),
        distance: 5.1,
        ml_score: 0.93,
        ml_priority: "HIGH",
        created_at: hoursAgo(0.8),
        updated_at: hoursAgo(0.8),
      });

      // Delivery 8: Pending Task (Available Delivery)
      await addDoc(collection(db, "deliveries"), {
        match_id: match8.id,
        donation: { ...SEED_DONATIONS[10], id: donationIds[10] },
        request: { ...SEED_REQUESTS[10], id: requestIds[10] },
        pickup_status: "pending",
        delivery_status: "pending",
        pickup_otp: generateOTP(),
        delivery_otp: generateOTP(),
        distance: 1.5,
        ml_score: 0.81,
        ml_priority: "MEDIUM",
        created_at: hoursAgo(1.0),
        updated_at: hoursAgo(1.0),
      });

      addLog("✅ 8 deliveries seeded with live tracking data (including available deliveries)");

      addLog("");
      addLog("🎉 Real-world demo environment successfully initialized!");
      addLog("   → Green Cafe (Donor): 3 donations (1 active, 2 matched)");
      addLog("   → Hope Foundation (NGO): 3 requests (1 active, 2 matched)");
      addLog("   → Live Tracking: Active for both Donor & NGO dashboards");

      setStatus("done");
    } catch (err) {
      console.error("Seed error:", err);
      addLog(`❌ Error: ${err}`);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-background">
      <Link
        href="/"
        className="absolute top-4 left-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Database className="h-6 w-6 text-primary" />
            Seed Realistic Demo Data
          </CardTitle>
          <CardDescription>
            Reset and populate Firestore with high-fidelity demo data.
            This ensures live tracking maps, ML scores, and donation histories are perfectly synced for a stunning demo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "idle" && (
            <Button onClick={runSeed} className="w-full gap-2" size="lg">
              <Database className="h-4 w-4" />
              Initialize Demo Environment
            </Button>
          )}

          {status === "seeding" && (
            <Button disabled className="w-full gap-2" size="lg">
              <Loader2 className="h-4 w-4 animate-spin" />
              Seeding data...
            </Button>
          )}

          {status === "done" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-primary font-medium">
                <CheckCircle className="h-5 w-5" />
                Demo environment ready!
              </div>
              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link href="/login">Go to Login</Link>
                </Button>
                <Button variant="outline" onClick={runSeed} className="flex-1">
                  Reset Again
                </Button>
              </div>
            </div>
          )}

          {status === "error" && (
            <Button onClick={runSeed} variant="destructive" className="w-full gap-2" size="lg">
              Retry Initialization
            </Button>
          )}

          {log.length > 0 && (
            <div className="rounded-lg bg-muted/60 border border-border p-4 max-h-64 overflow-y-auto">
              <pre className="text-xs text-foreground whitespace-pre-wrap font-mono">
                {log.join("\n")}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
