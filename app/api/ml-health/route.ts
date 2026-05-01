// app/api/ml-health/route.ts
// Health check endpoint for the ML prediction service

import { NextResponse } from "next/server";

const ML_API_URL = process.env.ML_API_URL || "http://localhost:8000";

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  try {
    const res = await fetchWithTimeout(`${ML_API_URL}/health`, 3000);

    if (!res.ok) {
      return NextResponse.json(
        { status: "unhealthy", model_loaded: false },
        { status: 503 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { status: "unavailable", model_loaded: false },
      { status: 503 }
    );
  }
}
