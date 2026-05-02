import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc, addDoc, collection, Timestamp, deleteDoc, getDocs } from "firebase/firestore";
import { generateOTP } from "@/lib/firestore";

const DEMO_USERS = [
  {
    uid: "demo-donor",
    email: "demo-donor@annsetu.org",
    name: "Taj West End",
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
    name: "Robin Hood Army",
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
    donor_name: "Taj West End",
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
    donor_name: "Taj West End",
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
    donor_id: "demo-donor-2",
    donor_name: "Corner House Ice Cream",
    food_type: "veg",
    quantity: 10,
    quantity_unit: "kg",
    expiry_time: hoursFromNow(8),
    pickup_window_start: hoursFromNow(2),
    pickup_window_end: hoursFromNow(6),
    packaging_condition: "good",
    location: { lat: 12.9783, lng: 77.5900, address: "Residency Road, Bangalore" },
    status: "active",
    created_at: hoursAgo(0.1),
  },
  {
    donor_id: "demo-donor",
    donor_name: "Taj West End",
    food_type: "veg",
    quantity: 100,
    quantity_unit: "meals",
    expiry_time: hoursAgo(2),
    pickup_window_start: hoursAgo(10),
    pickup_window_end: hoursAgo(6),
    packaging_condition: "good",
    location: { lat: 12.9817, lng: 77.5816, address: "Race Course Road, Bangalore" },
    status: "delivered",
    created_at: hoursAgo(12),
  },
  {
    donor_id: "demo-donor-2",
    donor_name: "Corner House Ice Cream",
    food_type: "veg",
    quantity: 20,
    quantity_unit: "kg",
    expiry_time: hoursAgo(24),
    pickup_window_start: hoursAgo(48),
    pickup_window_end: hoursAgo(44),
    packaging_condition: "excellent",
    location: { lat: 12.9783, lng: 77.5900, address: "Residency Road, Bangalore" },
    status: "delivered",
    created_at: hoursAgo(49),
  },
  {
    donor_id: "demo-donor-3",
    donor_name: "The Rameshwaram Cafe",
    food_type: "veg",
    quantity: 80,
    quantity_unit: "meals",
    expiry_time: hoursAgo(1),
    pickup_window_start: hoursAgo(6),
    pickup_window_end: hoursAgo(2),
    packaging_condition: "good",
    location: { lat: 12.9650, lng: 77.6050, address: "Indiranagar, Bangalore" },
    status: "delivered",
    created_at: hoursAgo(7),
  },
];

const SEED_REQUESTS = [
  {
    ngo_id: "demo-ngo",
    ngo_name: "Robin Hood Army",
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
    ngo_name: "Robin Hood Army",
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
    ngo_name: "Robin Hood Army",
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
    ngo_id: "demo-ngo-2",
    ngo_name: "Akshaya Patra Foundation",
    food_type: "veg",
    quantity: 200,
    people_count: 400,
    urgency: "high",
    time_window_start: hoursFromNow(0),
    time_window_end: hoursFromNow(2),
    storage_capability: true,
    location: { lat: 12.9450, lng: 77.5800, address: "Jayanagar 4th Block, Bangalore" },
    status: "active",
    created_at: hoursAgo(0.2),
  },
];

const GLOBAL_STATS = {
  meals_saved: 15420,
  food_waste_reduced_kg: 4125,
  active_deliveries: 38,
  ngos_served: 184,
  total_donations: 1650,
  total_deliveries: 1240,
};

import { writeBatch } from "firebase/firestore";

async function clearCollection(name: string, batch: any) {
  const snapshot = await getDocs(collection(db, name));
  snapshot.docs.forEach(d => {
    batch.delete(d.ref);
  });
}

export async function POST() {
  try {
    const batch = writeBatch(db);

    // 1. Setup Users & Stats
    for (const user of DEMO_USERS) {
      batch.set(doc(db, "users", user.uid), user, { merge: true });
    }
    batch.set(doc(db, "stats", "global"), GLOBAL_STATS, { merge: true });

    // 2. Clear existing dynamic data
    await clearCollection("donations", batch);
    await clearCollection("requests", batch);
    await clearCollection("matches", batch);
    await clearCollection("deliveries", batch);

    // 3. Seed Donations
    const donationIds: string[] = [];
    for (const d of SEED_DONATIONS) {
      const ref = doc(collection(db, "donations"));
      batch.set(ref, d);
      donationIds.push(ref.id);
    }

    // 4. Seed Requests
    const requestIds: string[] = [];
    for (const r of SEED_REQUESTS) {
      const ref = doc(collection(db, "requests"));
      batch.set(ref, r);
      requestIds.push(ref.id);
    }

    // 5. Create Matches
    const match1Ref = doc(collection(db, "matches"));
    batch.set(match1Ref, {
      donation_id: donationIds[2],
      request_id: requestIds[2],
      score: 95,
      ml_score: 0.96,
      ml_priority: "URGENT",
      status: "accepted",
      created_at: hoursAgo(2),
    });

    const match2Ref = doc(collection(db, "matches"));
    batch.set(match2Ref, {
      donation_id: donationIds[3],
      request_id: requestIds[4],
      score: 88,
      ml_score: 0.89,
      ml_priority: "HIGH",
      status: "accepted",
      created_at: hoursAgo(0.8),
    });

    const match3Ref = doc(collection(db, "matches"));
    batch.set(match3Ref, {
      donation_id: donationIds[4],
      request_id: requestIds[3],
      score: 75,
      ml_score: 0.72,
      ml_priority: "MEDIUM",
      status: "accepted",
      created_at: hoursAgo(1.5),
    });

    const match6Ref = doc(collection(db, "matches"));
    batch.set(match6Ref, {
      donation_id: donationIds[5],
      request_id: requestIds[5],
      score: 82,
      ml_score: 0.85,
      ml_priority: "HIGH",
      status: "accepted",
      created_at: hoursAgo(0.5),
    });

    const match4Ref = doc(collection(db, "matches"));
    batch.set(match4Ref, {
      donation_id: donationIds[6],
      request_id: requestIds[0],
      score: 92,
      status: "completed",
      created_at: hoursAgo(14),
    });

    const match5Ref = doc(collection(db, "matches"));
    batch.set(match5Ref, {
      donation_id: donationIds[7],
      request_id: requestIds[1],
      score: 85,
      status: "completed",
      created_at: hoursAgo(50),
    });

    const match7Ref = doc(collection(db, "matches"));
    batch.set(match7Ref, {
      donation_id: donationIds[2],
      request_id: requestIds[0],
      score: 91,
      ml_score: 0.93,
      ml_priority: "URGENT",
      status: "accepted",
      created_at: hoursAgo(0.2),
    });

    // 6. Create Deliveries
    
    // Delivery 1: In Progress for NGO (Robin Hood Army)
    batch.set(doc(collection(db, "deliveries")), {
      match_id: match1Ref.id,
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
        address: "Domlur Flyover, Bangalore" 
      },
      eta: "10 mins",
      created_at: hoursAgo(1.8),
      updated_at: hoursAgo(0.1),
    });

    // Delivery 2: In Progress for Donor (Taj West End)
    batch.set(doc(collection(db, "deliveries")), {
      match_id: match2Ref.id,
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
        address: "MG Road, Bangalore" 
      },
      eta: "5 mins",
      created_at: hoursAgo(0.7),
      updated_at: hoursAgo(0.05),
    });

    // Delivery 6: In Progress for Donor 2 (Corner House)
    batch.set(doc(collection(db, "deliveries")), {
      match_id: match6Ref.id,
      volunteer_id: "demo-volunteer-2",
      volunteer_name: "Priya Sharma",
      volunteer_phone: "+91 9876543220",
      donation: { ...SEED_DONATIONS[5], id: donationIds[5] },
      request: { ...SEED_REQUESTS[5], id: requestIds[5] },
      pickup_status: "picked",
      delivery_status: "in_transit",
      pickup_otp: "778899",
      delivery_otp: "112233",
      distance: 4.2,
      current_location: { 
        lat: 12.9600, 
        lng: 77.5850, 
        address: "Richmond Town, Bangalore" 
      },
      eta: "15 mins",
      created_at: hoursAgo(0.4),
      updated_at: hoursAgo(0.1),
    });

    // Delivery 7: Pending Pickup for Volunteer
    batch.set(doc(collection(db, "deliveries")), {
      match_id: match7Ref.id,
      volunteer_id: "demo-volunteer",
      volunteer_name: "Rahul Kumar",
      volunteer_phone: "+91 9876543212",
      donation: { ...SEED_DONATIONS[2], id: donationIds[2] },
      request: { ...SEED_REQUESTS[0], id: requestIds[0] },
      pickup_status: "pending",
      delivery_status: "pickup",
      pickup_otp: generateOTP(),
      delivery_otp: generateOTP(),
      distance: 3.5,
      current_location: { 
        lat: 12.9650, 
        lng: 77.6050, 
        address: "Indiranagar, Bangalore" 
      },
      eta: "8 mins",
      created_at: hoursAgo(0.2),
      updated_at: hoursAgo(0.01),
    });

    // Delivery 3: Available Task
    batch.set(doc(collection(db, "deliveries")), {
      match_id: match3Ref.id,
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

    // Delivery 4: History (Completed)
    batch.set(doc(collection(db, "deliveries")), {
      match_id: match4Ref.id,
      volunteer_id: "demo-volunteer",
      volunteer_name: "Rahul Kumar",
      volunteer_phone: "+91 9876543212",
      donation: { ...SEED_DONATIONS[6], id: donationIds[6] },
      request: { ...SEED_REQUESTS[0], id: requestIds[0] },
      pickup_status: "picked",
      delivery_status: "delivered",
      pickup_otp: "123456",
      delivery_otp: "654321",
      distance: 5.8,
      created_at: hoursAgo(13),
      updated_at: hoursAgo(11),
    });

    // Delivery 5: History (Completed)
    batch.set(doc(collection(db, "deliveries")), {
      match_id: match5Ref.id,
      volunteer_id: "demo-volunteer",
      volunteer_name: "Rahul Kumar",
      volunteer_phone: "+91 9876543212",
      donation: { ...SEED_DONATIONS[7], id: donationIds[7] },
      request: { ...SEED_REQUESTS[1], id: requestIds[1] },
      pickup_status: "picked",
      delivery_status: "delivered",
      pickup_otp: "998877",
      delivery_otp: "778899",
      distance: 8.2,
      created_at: hoursAgo(48),
      updated_at: hoursAgo(46),
    });

    // Commit all operations as a single unit
    await batch.commit();

    return NextResponse.json({ success: true, message: "Richer demo data environment initialized with active map data via writeBatch." });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
