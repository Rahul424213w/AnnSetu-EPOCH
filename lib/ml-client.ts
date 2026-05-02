// lib/ml-client.ts
// Client library for the AnnSetu ML Priority Prediction API
// Communicates with the FastAPI service (default: http://localhost:8000)

import type {
  MLPredictionInput,
  MLPredictionOutput,
  MLHealthResponse,
  Donation,
  NGORequest,
} from "./types";

export interface MLPredictionOutputWithFlag extends MLPredictionOutput {
  isRealPrediction: boolean;
}

const isBrowser = typeof window !== "undefined";

// In the browser we always call same-origin Next.js proxies to avoid CORS
const ML_BASE_URL = isBrowser
  ? ""
  : (process.env.ML_API_URL || process.env.NEXT_PUBLIC_ML_API_URL || "http://localhost:8000");

function mlUrl(path: "/health" | "/predict" | "/predict/batch") {
  if (!isBrowser) return `${ML_BASE_URL}${path}`;
  if (path === "/health") return "/api/ml-health";
  if (path === "/predict") return "/api/ml-predict";
  return "/api/ml-predict/batch";
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const upstream = init.signal;
  if (upstream) {
    if (upstream.aborted) controller.abort();
    else upstream.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Feature Extraction (lazy-loaded dependencies) ─────────────────────────────

/**
 * Extract ML features from a donation-NGO pair.
 * Lazy-loads delivery-engine to avoid module-level import bloat.
 */
export async function extractMLFeatures(
  donation: Donation,
  request: NGORequest
): Promise<MLPredictionInput> {
  // Lazy import - only loaded when actually needed
  const { getDistance, getTrafficFactor, calculateSpoilageRisk, calculateETA } = await import("./delivery-engine");

  // Distance in km
  const distance = getDistance(
    donation.location.lat, donation.location.lng,
    request.location.lat, request.location.lng
  );

  // Traffic factor from time-of-day heuristic
  const traffic = getTrafficFactor();

  // ETA computation
  const eta = calculateETA(
    donation.location.lat, donation.location.lng,
    request.location.lat, request.location.lng,
    donation.quantity
  );

  // Spoilage risk
  const spoilage = calculateSpoilageRisk(donation.food_type, eta.etaMinutes);

  // Need = people_count on the NGO side
  const need = request.people_count || 50;

  // Hunger index: urgency mapped to 0-1 scale
  let hunger = 0.5;
  if (request.urgency === "high") hunger = 0.9;
  else if (request.urgency === "medium") hunger = 0.6;
  else if (request.urgency === "low") hunger = 0.3;

  // Match probability: based on food type compatibility + quantity fit
  const quantityRatio = donation.quantity / (request.quantity || 1);
  const quantityFit = quantityRatio >= 0.8 && quantityRatio <= 1.2 ? 1.0
    : quantityRatio >= 0.5 && quantityRatio <= 1.5 ? 0.7
    : 0.4;
  const foodTypeMatch = donation.food_type === request.food_type ? 1.0 : 0.0;
  const matchProb = (foodTypeMatch * 0.6 + quantityFit * 0.4);

  return {
    need,
    hunger: Number(hunger.toFixed(4)),
    distance: Number(distance.toFixed(2)),
    routeTime: Number(eta.etaMinutes.toFixed(2)),
    trafficFactor: Number(traffic.factor.toFixed(4)),
    matchProb: Number(matchProb.toFixed(4)),
    spoilageRisk: Number(spoilage.score.toFixed(4)),
  };
}

// ─── API Calls ──────────────────────────────────────────────────────────────────

/**
 * Call the ML prediction API for a single donation-NGO pair.
 * Falls back to a heuristic score if the API is unavailable.
 */
export async function predictPriority(
  input: MLPredictionInput
): Promise<MLPredictionOutputWithFlag> {
  try {
    const res = await fetchWithTimeout(mlUrl("/predict"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }, 3000);

    if (!res.ok) throw new Error(`ML API error: ${res.status}`);

    const data = await res.json();
    return {
      ml_score: data.score ?? data.ml_score ?? 0.5,
      priority: data.priority ?? "MEDIUM",
      isRealPrediction: true,
    };
  } catch (err) {
    console.warn("ML API unavailable, using heuristic fallback:", err);
    return { ...heuristicFallback(input), isRealPrediction: false };
  }
}

/**
 * Batch prediction for multiple donation-NGO pairs.
 */
export async function predictPriorityBatch(
  inputs: MLPredictionInput[]
): Promise<MLPredictionOutput[]> {
  try {
    const res = await fetchWithTimeout(mlUrl("/predict/batch"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: inputs }),
    }, 5000);

    if (!res.ok) throw new Error(`ML batch API error: ${res.status}`);

    const data = await res.json();
    return data.results || data.map?.((d: any) => ({
      ml_score: d.score ?? d.ml_score ?? 0.5,
      priority: d.priority ?? "MEDIUM",
    })) || inputs.map(heuristicFallback);
  } catch (err) {
    console.warn("ML batch API unavailable, using heuristic fallback:", err);
    return inputs.map(heuristicFallback);
  }
}

/**
 * Check if the ML API is healthy and model is loaded.
 */
export async function checkMLHealth(): Promise<MLHealthResponse> {
  try {
    const res = await fetchWithTimeout(mlUrl("/health"), {}, 2000);
    if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
    return await res.json();
  } catch {
    return { status: "unavailable", model_loaded: false };
  }
}

// ─── Heuristic Fallback ─────────────────────────────────────────────────────────

/**
 * When the ML API is down, compute a reasonable priority score locally.
 * Mirrors the weak-supervision formula from generate_data.py.
 */
function heuristicFallback(input: MLPredictionInput): MLPredictionOutput {
  const raw =
    0.30 * (input.need / 200.0) +
    0.20 * input.hunger +
    0.20 * (1.0 / (input.routeTime + 1.0)) +
    0.20 * input.matchProb -
    0.10 * input.spoilageRisk;

  // Clamp to [0, 1]
  const score = Math.max(0, Math.min(1, raw * 1.5));

  let priority: "HIGH" | "MEDIUM" | "LOW";
  if (score > 0.75) priority = "HIGH";
  else if (score >= 0.4) priority = "MEDIUM";
  else priority = "LOW";

  return { ml_score: Number(score.toFixed(4)), priority };
}

// ─── High-level Convenience ─────────────────────────────────────────────────────

/**
 * Full pipeline: extract features from domain objects → get ML prediction.
 */
export async function getMLPrediction(
  donation: Donation,
  request: NGORequest
): Promise<MLPredictionOutput & { features: MLPredictionInput }> {
  const features = await extractMLFeatures(donation, request);
  const prediction = await predictPriority(features);
  return { ...prediction, features };
}
