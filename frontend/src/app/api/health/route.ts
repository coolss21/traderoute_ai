/**
 * GET /api/health
 * Health check endpoint for Firebase App Hosting and monitoring.
 */
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "TradeRoute AI",
    version: "2.0.0",
    architecture: "Next.js full-stack + Firebase App Hosting",
    engines: [
      "cost-engine",
      "risk-engine",
      "route-engine",
      "recommendation-engine",
      "cost-illusion-engine",
    ],
    timestamp: new Date().toISOString(),
  });
}
