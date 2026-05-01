import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc, addDoc, collection, Timestamp } from "firebase/firestore";
import { generateOTP } from "@/lib/firestore";

const DEMO_USERS = [
  {
    uid: "demo-donor",
    email: "demo-donor@annsetu.org",
    name: "Green Cafe",
    role: "donor",
    phone: "+91 9876543210",
    location: { lat: 12.9716, lng: 77.5946 },
  },
  {
    uid: "demo-donor-2",
    email: "demo-donor2@annsetu.org",
    name: "Spice Garden Restaurant",
    role: "donor",
    phone: "+91 9876543215",
    location: { lat: 12.9783, lng: 77.5900 },
  },
  {
    uid: "demo-donor-3",
    email: "demo-donor3@annsetu.org",
    name: "Royal Caterers",
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
    name: "Annapurna Trust",
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
    quantity: 25,
    quantity_unit: "meals",
    expiry_time: hoursFromNow(6),
    pickup_window_start: hoursFromNow(0.5),
    pickup_window_end: hoursFromNow(4),
    packaging_condition: "good",
    location: { lat: 12.9716, lng: 77.5946, address: "MG Road, Bangalore" },
    status: "active",
    created_at: hoursAgo(1),
  },
  {
    donor_id: "demo-donor-2",
    donor_name: "Spice Garden Restaurant",
    food_type: "non-veg",
    quantity: 40,
    quantity_unit: "meals",
    expiry_time: hoursFromNow(4),
    pickup_window_start: hoursFromNow(0),
    pickup_window_end: hoursFromNow(2),
    packaging_condition: "good",
    location: { lat: 12.9783, lng: 77.5900, address: "Brigade Road, Bangalore" },
    status: "active",
    created_at: hoursAgo(0.5),
  },
  {
    donor_id: "demo-donor",
    donor_name: "Green Cafe",
    food_type: "packaged",
    quantity: 50,
    quantity_unit: "meals",
    expiry_time: hoursFromNow(12),
    pickup_window_start: hoursFromNow(1),
    pickup_window_end: hoursFromNow(6),
    packaging_condition: "good",
    location: { lat: 12.9716, lng: 77.5946, address: "MG Road, Bangalore" },
    status: "matched",
    created_at: hoursAgo(2),
  },
  {
    donor_id: "demo-donor-3",
    donor_name: "Royal Caterers",
    food_type: "veg",
    quantity: 100,
    quantity_unit: "meals",
    expiry_time: hoursFromNow(3),
    pickup_window_start: hoursFromNow(0),
    pickup_window_end: hoursFromNow(2),
    packaging_condition: "fair",
    location: { lat: 12.9650, lng: 77.6050, address: "Indiranagar, Bangalore" },
    status: "matched",
    created_at: hoursAgo(3),
  },
  {
    donor_id: "demo-donor",
    donor_name: "Green Cafe",
    food_type: "veg",
    quantity: 30,
    quantity_unit: "meals",
    expiry_time: hoursAgo(2),
    pickup_window_start: hoursAgo(10),
    pickup_window_end: hoursAgo(6),
    packaging_condition: "good",
    location: { lat: 12.9716, lng: 77.5946, address: "MG Road, Bangalore" },
    status: "delivered",
    created_at: hoursAgo(12),
  },
  {
    donor_id: "demo-donor",
    donor_name: "Green Cafe",
    food_type: "packaged",
    quantity: 20,
    quantity_unit: "kg",
    expiry_time: hoursAgo(24),
    pickup_window_start: hoursAgo(48),
    pickup_window_end: hoursAgo(36),
    packaging_condition: "good",
    location: { lat: 12.9716, lng: 77.5946, address: "MG Road, Bangalore" },
    status: "delivered",
    created_at: hoursAgo(50),
  },
];

const SEED_REQUESTS = [
  {
    ngo_id: "demo-ngo",
    ngo_name: "Hope Foundation",
    food_type: "veg",
    quantity: 30,
    people_count: 60,
    urgency: "high",
    time_window_start: hoursFromNow(0),
    time_window_end: hoursFromNow(6),
    storage_capability: true,
    location: { lat: 12.9352, lng: 77.6245, address: "Koramangala, Bangalore" },
    status: "active",
    created_at: hoursAgo(1),
  },
  {
    ngo_id: "demo-ngo-2",
    ngo_name: "Annapurna Trust",
    food_type: "non-veg",
    quantity: 50,
    people_count: 100,
    urgency: "medium",
    time_window_start: hoursFromNow(1),
    time_window_end: hoursFromNow(8),
    storage_capability: false,
    location: { lat: 12.9450, lng: 77.5800, address: "Jayanagar, Bangalore" },
    status: "active",
    created_at: hoursAgo(2),
  },
  {
    ngo_id: "demo-ngo",
    ngo_name: "Hope Foundation",
    food_type: "packaged",
    quantity: 40,
    people_count: 80,
    urgency: "high",
    time_window_start: hoursFromNow(0),
    time_window_end: hoursFromNow(10),
    storage_capability: true,
    location: { lat: 12.9352, lng: 77.6245, address: "Koramangala, Bangalore" },
    status: "matched",
    created_at: hoursAgo(3),
  },
  {
    ngo_id: "demo-ngo",
    ngo_name: "Hope Foundation",
    food_type: "veg",
    quantity: 30,
    people_count: 60,
    urgency: "high",
    time_window_start: hoursAgo(14),
    time_window_end: hoursAgo(8),
    storage_capability: true,
    location: { lat: 12.9352, lng: 77.6245, address: "Koramangala, Bangalore" },
    status: "fulfilled",
    created_at: hoursAgo(15),
  },
];

const GLOBAL_STATS = {
  meals_saved: 12847,
  food_waste_reduced_kg: 3421,
  active_deliveries: 24,
  ngos_served: 156,
  total_donations: 1240,
  total_deliveries: 890,
};

export async function POST() {
  try {
    for (const user of DEMO_USERS) {
      await setDoc(doc(db, "users", user.uid), user, { merge: true });
    }
    await setDoc(doc(db, "stats", "global"), GLOBAL_STATS, { merge: true });

    const donationIds: string[] = [];
    for (const d of SEED_DONATIONS) {
      const ref = await addDoc(collection(db, "donations"), d);
      donationIds.push(ref.id);
    }

    const requestIds: string[] = [];
    for (const r of SEED_REQUESTS) {
      const ref = await addDoc(collection(db, "requests"), r);
      requestIds.push(ref.id);
    }

    const matchId1 = await addDoc(collection(db, "matches"), {
      donation_id: donationIds[2],
      request_id: requestIds[2],
      score: 85,
      status: "pending",
      created_at: hoursAgo(2),
    });

    const matchId2 = await addDoc(collection(db, "matches"), {
      donation_id: donationIds[3],
      request_id: requestIds[0],
      score: 72,
      status: "accepted",
      created_at: hoursAgo(2.5),
    });

    const matchId3 = await addDoc(collection(db, "matches"), {
      donation_id: donationIds[4],
      request_id: requestIds[3],
      score: 90,
      status: "completed",
      created_at: hoursAgo(14),
    });

    await addDoc(collection(db, "deliveries"), {
      match_id: matchId1.id,
      donation: { ...SEED_DONATIONS[2], id: donationIds[2] },
      request: { ...SEED_REQUESTS[2], id: requestIds[2] },
      pickup_status: "pending",
      delivery_status: "pending",
      pickup_otp: generateOTP(),
      delivery_otp: generateOTP(),
      distance: 4.2,
      created_at: hoursAgo(1.5),
      updated_at: hoursAgo(1.5),
    });

    await addDoc(collection(db, "deliveries"), {
      match_id: matchId2.id,
      donation: { ...SEED_DONATIONS[3], id: donationIds[3] },
      request: { ...SEED_REQUESTS[0], id: requestIds[0] },
      pickup_status: "pending",
      delivery_status: "pending",
      pickup_otp: generateOTP(),
      delivery_otp: generateOTP(),
      distance: 3.1,
      created_at: hoursAgo(2),
      updated_at: hoursAgo(2),
    });

    await addDoc(collection(db, "deliveries"), {
      match_id: matchId3.id,
      volunteer_id: "demo-volunteer",
      volunteer_name: "Rahul Kumar",
      volunteer_phone: "+91 9876543212",
      donation: { ...SEED_DONATIONS[4], id: donationIds[4] },
      request: { ...SEED_REQUESTS[3], id: requestIds[3] },
      pickup_status: "picked",
      delivery_status: "delivered",
      pickup_otp: "123456",
      delivery_otp: "654321",
      distance: 5.8,
      created_at: hoursAgo(13),
      updated_at: hoursAgo(11),
    });

    return NextResponse.json({ success: true, message: "Database successfully seeded." });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
