import type { Donation, NGORequest, Match } from "./types";
import { Timestamp } from "firebase/firestore";

interface MatchScore {
  donation: Donation;
  request: NGORequest;
  score: number;
  breakdown: {
    expiryScore: number;
    urgencyScore: number;
    distanceScore: number;
    quantityScore: number;
    foodTypeBonus: number;
  };
}

/**
 * Calculate the distance between two coordinates using the Haversine formula
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate match score between a donation and an NGO request
 * Higher score = better match
 */
function calculateMatchScore(
  donation: Donation,
  request: NGORequest
): MatchScore | null {
  // Filter out incompatible matches
  if (donation.food_type !== request.food_type) {
    return null;
  }

  // Check time window compatibility
  const donationExpiry = donation.expiry_time.toDate().getTime();
  const requestWindowStart = request.time_window_start.toDate().getTime();
  const requestWindowEnd = request.time_window_end.toDate().getTime();
  const now = Date.now();

  // Donation must expire after request window starts
  if (donationExpiry < requestWindowStart) {
    return null;
  }

  // Calculate individual scores (0-100 scale)

  // 1. Expiry Urgency Score (higher weight for urgent expiry)
  const hoursUntilExpiry = (donationExpiry - now) / (1000 * 60 * 60);
  let expiryScore: number;
  if (hoursUntilExpiry <= 2) {
    expiryScore = 100; // Very urgent, prioritize
  } else if (hoursUntilExpiry <= 6) {
    expiryScore = 80;
  } else if (hoursUntilExpiry <= 12) {
    expiryScore = 60;
  } else if (hoursUntilExpiry <= 24) {
    expiryScore = 40;
  } else {
    expiryScore = 20;
  }

  // 2. NGO Urgency Score
  let urgencyScore: number;
  switch (request.urgency) {
    case "high":
      urgencyScore = 100;
      break;
    case "medium":
      urgencyScore = 60;
      break;
    case "low":
      urgencyScore = 30;
      break;
    default:
      urgencyScore = 50;
  }

  // 3. Distance Score (lower distance = higher score)
  const distance = calculateDistance(
    donation.location.lat,
    donation.location.lng,
    request.location.lat,
    request.location.lng
  );
  let distanceScore: number;
  if (distance <= 2) {
    distanceScore = 100;
  } else if (distance <= 5) {
    distanceScore = 80;
  } else if (distance <= 10) {
    distanceScore = 60;
  } else if (distance <= 20) {
    distanceScore = 40;
  } else {
    distanceScore = 20;
  }

  // 4. Quantity Match Score
  const quantityRatio = donation.quantity / request.quantity;
  let quantityScore: number;
  if (quantityRatio >= 0.8 && quantityRatio <= 1.2) {
    quantityScore = 100; // Good match
  } else if (quantityRatio >= 0.5 && quantityRatio <= 1.5) {
    quantityScore = 70;
  } else if (quantityRatio >= 0.3 && quantityRatio <= 2) {
    quantityScore = 50;
  } else {
    quantityScore = 30;
  }

  // 5. Food Type Bonus (exact match already verified)
  const foodTypeBonus = 20;

  // Calculate weighted total score
  const weights = {
    expiry: 0.25,
    urgency: 0.25,
    distance: 0.20,
    quantity: 0.15,
    foodType: 0.15,
  };

  const totalScore = Math.round(
    expiryScore * weights.expiry +
    urgencyScore * weights.urgency +
    distanceScore * weights.distance +
    quantityScore * weights.quantity +
    foodTypeBonus * weights.foodType
  );

  return {
    donation,
    request,
    score: totalScore,
    breakdown: {
      expiryScore,
      urgencyScore,
      distanceScore,
      quantityScore,
      foodTypeBonus,
    },
  };
}

/**
 * Find the best matches for all active donations and requests
 */
export function findMatches(
  donations: Donation[],
  requests: NGORequest[]
): MatchScore[] {
  const matches: MatchScore[] = [];

  // Filter active items only
  const activeDonations = donations.filter((d) => d.status === "active");
  const activeRequests = requests.filter((r) => r.status === "active");

  // Calculate scores for all possible combinations
  for (const donation of activeDonations) {
    for (const request of activeRequests) {
      const match = calculateMatchScore(donation, request);
      if (match) {
        matches.push(match);
      }
    }
  }

  // Sort by score (highest first)
  matches.sort((a, b) => b.score - a.score);

  return matches;
}

/**
 * Find the best match for a specific donation
 */
export function findBestMatchForDonation(
  donation: Donation,
  requests: NGORequest[]
): MatchScore | null {
  const activeRequests = requests.filter((r) => r.status === "active");
  let bestMatch: MatchScore | null = null;

  for (const request of activeRequests) {
    const match = calculateMatchScore(donation, request);
    if (match && (!bestMatch || match.score > bestMatch.score)) {
      bestMatch = match;
    }
  }

  return bestMatch;
}

/**
 * Find the best match for a specific NGO request
 */
export function findBestMatchForRequest(
  request: NGORequest,
  donations: Donation[]
): MatchScore | null {
  const activeDonations = donations.filter((d) => d.status === "active");
  let bestMatch: MatchScore | null = null;

  for (const donation of activeDonations) {
    const match = calculateMatchScore(donation, request);
    if (match && (!bestMatch || match.score > bestMatch.score)) {
      bestMatch = match;
    }
  }

  return bestMatch;
}

/**
 * Create a match record from a MatchScore
 */
export function createMatchFromScore(matchScore: MatchScore): Omit<Match, "id" | "created_at"> {
  return {
    donation_id: matchScore.donation.id!,
    request_id: matchScore.request.id!,
    score: matchScore.score,
    status: "pending",
  };
}

/**
 * Get distance between donation and request locations
 */
export function getMatchDistance(donation: Donation, request: NGORequest): number {
  return calculateDistance(
    donation.location.lat,
    donation.location.lng,
    request.location.lat,
    request.location.lng
  );
}
