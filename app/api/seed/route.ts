import { NextResponse } from "next/server";

// The Firebase client SDK (browser-targeted) cannot be used in a Next.js API
// route (Node.js server context) because its gRPC/WebSocket transport layer
// is not compatible with Node.js, producing "Write stream" GRPC errors.
//
// All seeding is handled client-side at /seed which runs in the browser.
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message:
        "Server-side seeding is disabled. Please use the /seed page which runs in the browser and has direct Firestore access.",
    },
    { status: 400 }
  );
}

export async function GET() {
  return NextResponse.redirect(new URL("/seed", "http://localhost:3000"));
}
