// lib/matching-engine.ts
// Optimized matching engine with lazy-loaded ML integration

import type { Donation, NGORequest, Match } from "./types";
import { Timestamp } from "firebase/firestore";

export interface MatchScore {
  donation: Donation;
  request: NGORequest;
  score: number;
  ml_score?: number;
  ml_priority?: "HIGH" | "MEDIUM" | "LOW";
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
 * Optimized with:
 * - Food type grouping (reduces comparisons)
 * - Spatial bounding box filter (avoids expensive Haversine for distant points)
 * - Early filtering of low-quality matches
 * - Hard limit on result size to prevent memory issues
 */
export function findMatches(
  donations: Donation[],
  requests: NGORequest[]
): MatchScore[] {
  const matches: MatchScore[] = [];

  const activeDonations = donations.filter((d) => d.status === "active");
  const activeRequests = requests.filter((r) => r.status === "active");

  // Optimization 1: Group requests by food_type (Hash Map)
  // This turns O(N*M) into O(N * (M/Categories)), massively reducing iterations.
  const requestsByFoodType = new Map<string, NGORequest[]>();
  for (const req of activeRequests) {
    const list = requestsByFoodType.get(req.food_type) || [];
    list.push(req);
    requestsByFoodType.set(req.food_type, list);
  }

  // Optimization 2: Fast spatial bounding box filter
  // ~0.5 degrees difference is roughly 55km. Avoids heavy Haversine math for distant points.
  const MAX_COORD_DIFF = 0.5;

  for (const donation of activeDonations) {
    const compatibleRequests = requestsByFoodType.get(donation.food_type);
    if (!compatibleRequests) continue;

    for (const request of compatibleRequests) {
      // Fast spatial pre-check before expensive math
      if (
        Math.abs(donation.location.lat - request.location.lat) > MAX_COORD_DIFF ||
        Math.abs(donation.location.lng - request.location.lng) > MAX_COORD_DIFF
      ) {
        continue;
      }

      const match = calculateMatchScore(donation, request);

      // Optimization 3: Only push high-quality heuristic matches (Score > 40)
      if (match && match.score > 40) {
        matches.push(match);
      }
    }
  }

  // Sort by score (highest first)
  matches.sort((a, b) => b.score - a.score);

  // Optimization 4: Slice array before returning!
  // This prevents the "deserialization crash" when Next.js passes data to the client.
  return matches.slice(0, 200);
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
    ml_score: matchScore.ml_score,
    ml_priority: matchScore.ml_priority,
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

// ─── ML-Enhanced Matching (Lazy-loaded) ─────────────────────────────────────────

/**
 * Find matches with ML-enhanced scoring.
 * Runs heuristic matching first, then enriches top candidates with ML predictions.
 * ML client is lazy-loaded to avoid module-level import bloat.
 */
export async function findMatchesWithML(
  donations: Donation[],
  requests: NGORequest[]
): Promise<MatchScore[]> {
  // Get heuristic matches first - already limited to top 200
  const matches = findMatches(donations, requests);
  if (matches.length === 0) return [];

  // Limit to top 30 for ML enrichment to avoid API overload
  const topMatches = matches.slice(0, 30);

  try {
    // Lazy import - only loads when actually needed
    const { extractMLFeatures, predictPriority } = await import("./ml-client");

    // Process sequentially to avoid overwhelming the ML API
    const enriched: MatchScore[] = [];
    for (const match of topMatches) {
      try {
        const features = await extractMLFeatures(match.donation, match.request);
        const prediction = await predictPriority(features);
        enriched.push({
          ...match,
          ml_score: prediction.ml_score,
          ml_priority: prediction.priority,
          // Blend: 60% ML score + 40% heuristic (both normalised to 0-100)
          score: Math.round(prediction.ml_score * 60 + match.score * 0.4),
        });
      } catch {
        enriched.push(match); // keep heuristic score on failure
      }
    }

    // Re-sort by blended score
    enriched.sort((a, b) => b.score - a.score);
    return enriched;
  } catch {
    // ML unavailable, return heuristic matches
    return matches;
  }
}

/**
 * Find the best ML-scored match for a specific donation
 */
export async function findBestMatchForDonationWithML(
  donation: Donation,
  requests: NGORequest[]
): Promise<MatchScore | null> {
  const matches = await findMatchesWithML([donation], requests);
  return matches.length > 0 ? matches[0] : null;
}
