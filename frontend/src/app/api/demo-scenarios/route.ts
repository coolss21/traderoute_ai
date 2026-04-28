/**
 * GET /api/demo-scenarios
 * Returns preset demo scenarios stored in Firestore (falls back to static list).
 */
import { NextResponse } from "next/server";

const STATIC_SCENARIOS = [
  {
    id: "china-pune-plastics",
    label: "🎯 Plastics from China → Pune",
    description: "Classic Cost Illusion demo: Sea via Mumbai looks cheapest but hides high congestion risk.",
    params: {
      hsn_code: "3923",
      origin: "China",
      destination: "Pune",
      quantity: 5000,
      invoice_value: 25000,
      urgency: "medium",
      buyer_priority: "balance",
    },
  },
  {
    id: "china-pune-electronics",
    label: "💻 Laptops from China → Pune",
    description: "Zero BCD on computers. Air freight becomes cost-competitive due to low duty.",
    params: {
      hsn_code: "8471",
      origin: "China",
      destination: "Pune",
      quantity: 200,
      invoice_value: 80000,
      urgency: "high",
      buyer_priority: "speed",
    },
  },
  {
    id: "vietnam-pune-garments",
    label: "👕 Garments from Vietnam → Pune",
    description: "20% BCD on knitted garments. Sea route risk comparison with Vietnam origin.",
    params: {
      hsn_code: "6110",
      origin: "Vietnam",
      destination: "Pune",
      quantity: 10000,
      invoice_value: 45000,
      urgency: "low",
      buyer_priority: "cost",
    },
  },
  {
    id: "china-pune-steel-typhoon",
    label: "⛈️ Steel Pipes + Typhoon Disruption",
    description: "Simulate a South China Sea typhoon. Watch how route risk and costs spike dramatically.",
    params: {
      hsn_code: "7304",
      origin: "China",
      destination: "Pune",
      quantity: 2000,
      invoice_value: 60000,
      urgency: "critical",
      buyer_priority: "balance",
      simulate_disruption: "typhoon",
    },
  },
  {
    id: "china-pune-pharma",
    label: "💊 Pharma APIs from China → Pune",
    description: "Reduced BCD for pharma intermediates. High urgency increases time-weight in scoring.",
    params: {
      hsn_code: "2933",
      origin: "China",
      destination: "Pune",
      quantity: 500,
      invoice_value: 120000,
      urgency: "critical",
      buyer_priority: "speed",
    },
  },
];

export async function GET() {
  try {
    // Attempt Firestore fetch — use static fallback if unavailable
    try {
      const { db } = await import("@/lib/firebase");
      const { collection, getDocs, query, orderBy, limit } = await import("firebase/firestore");
      const q = query(collection(db, "demo_scenarios"), orderBy("order", "asc"), limit(10));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const scenarios = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json({ scenarios });
      }
    } catch {
      // Firestore not configured — use static fallback
    }
    return NextResponse.json({ scenarios: STATIC_SCENARIOS });
  } catch (err) {
    return NextResponse.json({ scenarios: STATIC_SCENARIOS });
  }
}
