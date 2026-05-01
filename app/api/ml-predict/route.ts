// app/api/ml-predict/route.ts
// Next.js API route — proxies single prediction requests to the FastAPI ML service

import { NextResponse } from "next/server";

const ML_API_URL = process.env.ML_API_URL || "http://localhost:8000";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const res = await fetch(`${ML_API_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json(
        { error: "ML API returned an error", detail: errText },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("ML predict proxy error:", error);
    return NextResponse.json(
      { error: "ML service unavailable", detail: error.message },
      { status: 503 }
    );
  }
}
