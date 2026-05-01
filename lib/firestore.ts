import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  Donation,
  NGORequest,
  Match,
  Delivery,
  ImpactStats
} from "./types";

// Collection references
export const usersCollection = collection(db, "users");
export const donationsCollection = collection(db, "donations");
export const requestsCollection = collection(db, "requests");
export const matchesCollection = collection(db, "matches");
export const deliveriesCollection = collection(db, "deliveries");
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
  const q = query(donationsCollection, where("donor_id", "==", donorId));
  const snapshot = await getDocs(q);
  const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Donation));
  return items.sort((a, b) => {
    const tA = a.created_at?.toDate?.()?.getTime() || 0;
    const tB = b.created_at?.toDate?.()?.getTime() || 0;
    return tB - tA;
  });
}

export async function getActiveDonations() {
  const q = query(donationsCollection, where("status", "==", "active"));
  const snapshot = await getDocs(q);
  const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Donation));
  return items.sort((a, b) => {
    const tA = a.expiry_time?.toDate?.()?.getTime() || 0;
    const tB = b.expiry_time?.toDate?.()?.getTime() || 0;
    return tA - tB;
  });
}

export async function updateDonation(id: string, data: Partial<Donation>) {
  if (!id || id.startsWith("demo-")) return;
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
  const q = query(requestsCollection, where("ngo_id", "==", ngoId));
  const snapshot = await getDocs(q);
  const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as NGORequest));
  return items.sort((a, b) => {
    const tA = a.created_at?.toDate?.()?.getTime() || 0;
    const tB = b.created_at?.toDate?.()?.getTime() || 0;
    return tB - tA;
  });
}

export async function getActiveRequests() {
  const q = query(requestsCollection, where("status", "==", "active"));
  const snapshot = await getDocs(q);
  const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as NGORequest));
  // Sort by urgency descending
  const urgencyMap: Record<string, number> = { high: 3, medium: 2, low: 1 };
  return items.sort((a, b) => (urgencyMap[b.urgency || "low"] || 0) - (urgencyMap[a.urgency || "low"] || 0));
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
  if (!id || id.startsWith("demo-")) return;
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
  if (!id || id.startsWith("demo-")) return;
  await updateDoc(doc(matchesCollection, id), data);
}

// ─── Deliveries ────────────────────────────────────────────────────────────────
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

export async function getAvailableDeliveries() {
  const q = query(deliveriesCollection, where("delivery_status", "==", "pending"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Delivery));
}

export async function acceptDelivery(
  deliveryId: string,
  volunteerId: string,
  volunteerName: string,
  volunteerPhone?: string
) {
  if (!deliveryId || deliveryId.startsWith("demo-")) return;
  await updateDoc(doc(deliveriesCollection, deliveryId), {
    volunteer_id: volunteerId,
    volunteer_name: volunteerName,
    volunteer_phone: volunteerPhone ?? null,
    delivery_status: "assigned",
    pickup_status: "pending",
    updated_at: Timestamp.now(),
  });
}

export async function getDeliveriesByVolunteer(volunteerId: string) {
  const q = query(deliveriesCollection, where("volunteer_id", "==", volunteerId));
  const snapshot = await getDocs(q);
  const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Delivery));
  return items.sort((a, b) => {
    const tA = a.created_at?.toDate?.()?.getTime() || 0;
    const tB = b.created_at?.toDate?.()?.getTime() || 0;
    return tB - tA;
  });
}

export function subscribeToVolunteerDeliveries(volunteerId: string, callback: (deliveries: Delivery[]) => void): Unsubscribe {
  const q = query(deliveriesCollection, where("volunteer_id", "==", volunteerId));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Delivery));
    items.sort((a, b) => {
      const tA = a.created_at?.toDate?.()?.getTime() || 0;
      const tB = b.created_at?.toDate?.()?.getTime() || 0;
      return tB - tA;
    });
    callback(items);
  });
}

export async function updateDeliveryStatus(deliveryId: string, status: Delivery["delivery_status"], extra?: Partial<Delivery>) {
  if (!deliveryId || deliveryId.startsWith("demo-")) return;
  await updateDoc(doc(deliveriesCollection, deliveryId), {
    delivery_status: status,
    ...extra,
    updated_at: Timestamp.now(),
  });
}

// ─── Real-time Subscriptions ──────────────────────────────────────────────────
export function subscribeToDonorDonations(donorId: string, callback: (donations: Donation[]) => void): Unsubscribe {
  const q = query(donationsCollection, where("donor_id", "==", donorId));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Donation));
    items.sort((a, b) => {
      const tA = a.created_at?.toDate?.()?.getTime() || 0;
      const tB = b.created_at?.toDate?.()?.getTime() || 0;
      return tB - tA;
    });
    callback(items);
  }, (err) => {
    console.error("subscribeToDonorDonations error:", err);
    callback([]);
  });
}

export function subscribeToNGORequests(ngoId: string, callback: (requests: NGORequest[]) => void): Unsubscribe {
  const q = query(requestsCollection, where("ngo_id", "==", ngoId));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as NGORequest));
    items.sort((a, b) => {
      const tA = a.created_at?.toDate?.()?.getTime() || 0;
      const tB = b.created_at?.toDate?.()?.getTime() || 0;
      return tB - tA;
    });
    callback(items);
  }, (err) => {
    console.error("subscribeToNGORequests error:", err);
    callback([]);
  });
}

export function subscribeToAvailableDeliveries(callback: (deliveries: Delivery[]) => void): Unsubscribe {
  const q = query(deliveriesCollection, where("delivery_status", "==", "pending"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Delivery)));
  }, (err) => {
    console.error("subscribeToAvailableDeliveries error:", err);
    callback([]);
  });
}

// ─── Impact Stats ──────────────────────────────────────────────────────────────
export function subscribeToImpactStats(callback: (stats: ImpactStats) => void): Unsubscribe {
  const statsDoc = doc(statsCollection, "global");
  return onSnapshot(statsDoc, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as ImpactStats);
    } else {
      // No stats doc - let the component use fallback values
      // Don't compute live from collections (expensive on large datasets)
      console.warn("No global stats document found - using fallback values");
    }
  });
}

// ─── Matching Engine Trigger ───────────────────────────────────────────────────
// Lazy-loaded to avoid bundling matching engine in initial load
export async function triggerMatchingForDonation(donationId: string): Promise<void> {
  try {
    // Lazy import - only loaded when a donation is actually created
    const { findBestMatchForDonationWithML, getMatchDistance } = await import("./matching-engine");

    const donationDoc = await getDoc(doc(donationsCollection, donationId));
    if (!donationDoc.exists()) return;
    const donation = { id: donationDoc.id, ...donationDoc.data() } as Donation;

    const activeRequests = await getActiveRequests();
    if (activeRequests.length === 0) return;

    const bestMatch = await findBestMatchForDonationWithML(donation, activeRequests);
    if (!bestMatch || bestMatch.score < 30) return;

    const distance = getMatchDistance(donation, bestMatch.request);
    const matchId = await createMatch({
      donation_id: donationId,
      request_id: bestMatch.request.id!,
      score: bestMatch.score,
      ml_score: bestMatch.ml_score,
      ml_priority: bestMatch.ml_priority,
      status: "pending",
    });

    await createDelivery({
      match_id: matchId,
      donation: { ...donation, id: donationId },
      request: bestMatch.request,
      pickup_status: "pending",
      delivery_status: "pending",
      distance: Math.round(distance * 10) / 10,
      ml_score: bestMatch.ml_score,
      ml_priority: bestMatch.ml_priority,
    });

    await updateDonation(donationId, { status: "matched" });
    await updateRequest(bestMatch.request.id!, { status: "matched" });
  } catch (err) {
    console.error("Matching engine trigger error:", err);
  }
}
