import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  type QueryConstraint,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  Donation,
  NGORequest,
  Match,
  Delivery,
  ImpactStats,
} from "./types";

// Collection references
export const usersCollection = collection(db, "users");
export const donationsCollection = collection(db, "donations");
export const requestsCollection = collection(db, "requests");
export const matchesCollection = collection(db, "matches");
export const deliveriesCollection = collection(db, "deliveries");
export const fundsCollection = collection(db, "donation_funds");
export const statsCollection = collection(db, "stats");

// ─── OTP Generator ─────────────────────────────────────────────────────────────
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ─── Donations ─────────────────────────────────────────────────────────────────
export async function createDonation(donation: Omit<Donation, "id" | "created_at">) {
  const docRef = await addDoc(donationsCollection, {
    ...donation,
    created_at: Timestamp.now(),
  });
  return docRef.id;
}

export async function getDonationsByDonor(donorId: string) {
  const q = query(
    donationsCollection,
    where("donor_id", "==", donorId),
    orderBy("created_at", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Donation));
}

export async function getActiveDonations() {
  const q = query(
    donationsCollection,
    where("status", "==", "active"),
    orderBy("expiry_time", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Donation));
}

export async function updateDonation(id: string, data: Partial<Donation>) {
  await updateDoc(doc(donationsCollection, id), data);
}

export async function getDonationById(id: string) {
  const docRef = doc(donationsCollection, id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as Donation;
  }
  return null;
}

// ─── NGO Requests ───────────────────────────────────────────────────────────────
export async function createRequest(request: Omit<NGORequest, "id" | "created_at">) {
  const docRef = await addDoc(requestsCollection, {
    ...request,
    created_at: Timestamp.now(),
  });
  return docRef.id;
}

export async function getRequestsByNGO(ngoId: string) {
  const q = query(
    requestsCollection,
    where("ngo_id", "==", ngoId),
    orderBy("created_at", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as NGORequest));
}

export async function getActiveRequests() {
  const q = query(
    requestsCollection,
    where("status", "==", "active"),
    orderBy("urgency", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as NGORequest));
}

export async function getRequestById(id: string) {
  const docRef = doc(requestsCollection, id);
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as NGORequest;
  }
  return null;
}

export async function updateRequest(id: string, data: Partial<NGORequest>) {
  await updateDoc(doc(requestsCollection, id), data);
}

// ─── Matches ───────────────────────────────────────────────────────────────────
export async function createMatch(match: Omit<Match, "id" | "created_at">) {
  const docRef = await addDoc(matchesCollection, {
    ...match,
    created_at: Timestamp.now(),
  });
  return docRef.id;
}

export async function getMatchesByDonation(donationId: string) {
  const q = query(matchesCollection, where("donation_id", "==", donationId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Match));
}

export async function getMatchesByRequest(requestId: string) {
  const q = query(matchesCollection, where("request_id", "==", requestId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Match));
}

export async function updateMatch(id: string, data: Partial<Match>) {
  await updateDoc(doc(matchesCollection, id), data);
}

// ─── Deliveries ────────────────────────────────────────────────────────────────

/**
 * Create a delivery record with status "pending" (waiting for volunteer to accept).
 * OTPs are generated and stored here.
 */
export async function createDelivery(
  delivery: Omit<Delivery, "id" | "created_at" | "updated_at" | "pickup_otp" | "delivery_otp">
) {
  const now = Timestamp.now();
  const docRef = await addDoc(deliveriesCollection, {
    ...delivery,
    delivery_status: delivery.delivery_status ?? "pending",
    pickup_otp: generateOTP(),
    delivery_otp: generateOTP(),
    created_at: now,
    updated_at: now,
  });
  return docRef.id;
}

/**
 * Get all deliveries with status "pending" (no volunteer assigned yet).
 * These show up in the volunteer's "Available Deliveries" list.
 */
export async function getAvailableDeliveries() {
  const q = query(
    deliveriesCollection,
    where("delivery_status", "==", "pending")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Delivery));
}

/**
 * Volunteer accepts a delivery: assigns themselves, sets status to "assigned".
 * OTPs are already stored in the delivery doc from createDelivery().
 */
export async function acceptDelivery(
  deliveryId: string,
  volunteerId: string,
  volunteerName: string,
  volunteerPhone?: string
) {
  await updateDoc(doc(deliveriesCollection, deliveryId), {
    volunteer_id: volunteerId,
    volunteer_name: volunteerName,
    volunteer_phone: volunteerPhone ?? null,
    delivery_status: "assigned",
    pickup_status: "pending",
    updated_at: Timestamp.now(),
  });
}

/**
 * Update delivery status and optional extra fields.
 * Used by the DeliveryTracker component to persist state changes.
 */
export async function updateDeliveryStatus(
  deliveryId: string,
  deliveryStatus: Delivery["delivery_status"],
  extra?: Partial<Delivery>
) {
  await updateDoc(doc(deliveriesCollection, deliveryId), {
    delivery_status: deliveryStatus,
    ...extra,
    updated_at: Timestamp.now(),
  });
}

/**
 * Get all deliveries for a specific volunteer (requires composite index).
 * Index URL: https://console.firebase.google.com/v1/r/project/annsetu-v0-cc0c1/firestore/indexes?create_composite=...
 */
export async function getDeliveriesByVolunteer(volunteerId: string) {
  const q = query(
    deliveriesCollection,
    where("volunteer_id", "==", volunteerId),
    orderBy("created_at", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Delivery));
}

/**
 * Real-time listener for a volunteer's active deliveries.
 */
export function subscribeToVolunteerDeliveries(
  volunteerId: string,
  callback: (deliveries: Delivery[]) => void
): Unsubscribe {
  const q = query(
    deliveriesCollection,
    where("volunteer_id", "==", volunteerId),
    orderBy("created_at", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const deliveries = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Delivery));
    callback(deliveries);
  });
}

/**
 * Update a delivery (generic).
 */
export async function updateDelivery(id: string, data: Partial<Delivery>) {
  await updateDoc(doc(deliveriesCollection, id), {
    ...data,
    updated_at: Timestamp.now(),
  });
}

// ─── Real-time Donor Stats ──────────────────────────────────────────────────────
export function subscribeToDonorDonations(
  donorId: string,
  callback: (donations: Donation[]) => void
): Unsubscribe {
  const q = query(
    donationsCollection,
    where("donor_id", "==", donorId),
    orderBy("created_at", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Donation)));
  }, (err) => {
    console.error("subscribeToDonorDonations error:", err);
    callback([]);
  });
}

// ─── Real-time NGO Requests ─────────────────────────────────────────────────────
export function subscribeToNGORequests(
  ngoId: string,
  callback: (requests: NGORequest[]) => void
): Unsubscribe {
  const q = query(
    requestsCollection,
    where("ngo_id", "==", ngoId),
    orderBy("created_at", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as NGORequest)));
  }, (err) => {
    console.error("subscribeToNGORequests error:", err);
    callback([]);
  });
}

// ─── Real-time Available (Pending) Deliveries ───────────────────────────────────
export function subscribeToAvailableDeliveries(
  callback: (deliveries: Delivery[]) => void
): Unsubscribe {
  const q = query(
    deliveriesCollection,
    where("delivery_status", "==", "pending")
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Delivery)));
  }, (err) => {
    console.error("subscribeToAvailableDeliveries error:", err);
    callback([]);
  });
}

// ─── Impact Stats — Real-time from aggregated doc or live compute ───────────────
export function subscribeToImpactStats(
  callback: (stats: ImpactStats) => void
): Unsubscribe {
  // First try the pre-aggregated stats doc
  const statsDoc = doc(statsCollection, "global");
  return onSnapshot(statsDoc, async (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as ImpactStats);
    } else {
      // Compute live from collections
      try {
        const [donSnap, delSnap, ngoSnap] = await Promise.all([
          getDocs(donationsCollection),
          getDocs(deliveriesCollection),
          getDocs(query(requestsCollection)),
        ]);

        const allDonations = donSnap.docs.map((d) => d.data());
        const allDeliveries = delSnap.docs.map((d) => d.data());

        const deliveredCount = allDeliveries.filter((d) => d.delivery_status === "delivered").length;
        const activeCount = allDeliveries.filter((d) =>
          ["assigned", "pickup", "in_transit"].includes(d.delivery_status)
        ).length;

        const totalMeals = allDonations
          .filter((d) => d.status === "delivered" || d.status === "matched")
          .reduce((sum, d) => sum + (d.quantity || 0), 0);

        const totalKg = allDonations
          .filter((d) => (d.status === "delivered" || d.status === "matched") && d.quantity_unit === "kg")
          .reduce((sum, d) => sum + (d.quantity || 0), 0);

        const uniqueNGOs = new Set(
          ngoSnap.docs.map((d) => d.data().ngo_id).filter(Boolean)
        ).size;

        callback({
          meals_saved: totalMeals,
          food_waste_reduced_kg: totalKg,
          active_deliveries: activeCount,
          ngos_served: uniqueNGOs,
          total_donations: allDonations.length,
          total_deliveries: deliveredCount,
        });
      } catch (err) {
        console.error("Live impact stats error:", err);
        callback({
          meals_saved: 0,
          food_waste_reduced_kg: 0,
          active_deliveries: 0,
          ngos_served: 0,
          total_donations: 0,
          total_deliveries: 0,
        });
      }
    }
  });
}

/** @deprecated Use subscribeToImpactStats instead */
export function subscribeToStats(callback: (stats: ImpactStats) => void) {
  return subscribeToImpactStats(callback);
}

// ─── Matching Engine Integration ────────────────────────────────────────────────
/**
 * Run the matching engine for a newly created donation.
 * Fetches active requests, finds best match, creates Match + Delivery docs.
 */
export async function triggerMatchingForDonation(donationId: string): Promise<void> {
  try {
    const { findBestMatchForDonation, getMatchDistance } = await import("./matching-engine");

    const donationDoc = await getDoc(doc(donationsCollection, donationId));
    if (!donationDoc.exists()) return;
    const donation = { id: donationDoc.id, ...donationDoc.data() } as Donation;

    const activeRequests = await getActiveRequests();
    if (activeRequests.length === 0) return;

    const bestMatch = findBestMatchForDonation(donation, activeRequests);
    if (!bestMatch || bestMatch.score < 30) return; // Minimum 30% match score

    const request = bestMatch.request;
    const distance = getMatchDistance(donation, request);

    // Create match record
    const matchId = await createMatch({
      donation_id: donationId,
      request_id: request.id!,
      score: bestMatch.score,
      status: "pending",
    });

    // Create delivery record (pending — waiting for NGO acceptance, then volunteer)
    await createDelivery({
      match_id: matchId,
      donation: { ...donation, id: donationId },
      request,
      pickup_status: "pending",
      delivery_status: "pending",
      distance: Math.round(distance * 10) / 10,
    });

    // Update donation and request statuses to "matched"
    await updateDonation(donationId, { status: "matched" });
    await updateRequest(request.id!, { status: "matched" });
  } catch (err) {
    console.error("Matching engine error:", err);
    // Non-fatal — donation is still created even if matching fails
  }
}
