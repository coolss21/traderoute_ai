"""
Recommendation Engine – Selects the best route based on buyer priority,
risk-adjusted cost, and time sensitivity. Generates human-readable explanations.
"""
from __future__ import annotations
from typing import Dict, Any, List

def generate_recommendation(
    routes: List[Dict[str, Any]],
    buyer_priority: str,
    urgency: str,
) -> Dict[str, Any]:
    if not routes:
        return {"recommended_route_type":"balanced","confidence_score":0,"explanation":"No routes available."}

    # Weight profiles based on buyer priority
    weights = {
        "cost":    {"cost": 0.55, "time": 0.15, "risk": 0.30},
        "speed":   {"cost": 0.15, "time": 0.55, "risk": 0.30},
        "balance": {"cost": 0.35, "time": 0.30, "risk": 0.35},
    }
    w = weights.get(buyer_priority, weights["balance"])

    # Urgency boost for time weight
    urgency_boost = {"low": 0, "medium": 0.05, "high": 0.10, "critical": 0.20}
    boost = urgency_boost.get(urgency, 0.05)
    w["time"] += boost
    total_w = sum(w.values())
    w = {k: v/total_w for k, v in w.items()}

    # Normalize dimensions
    max_tc = max(r["true_cost"] for r in routes) or 1
    max_td = max(r["transit_days"] for r in routes) or 1

    scored = []
    for r in routes:
        cost_s = 1 - (r["true_cost"] / max_tc)
        time_s = 1 - (r["transit_days"] / max_td)
        risk_s = r["risk_assessment"]["transit_reliability_score"] / 100
        composite = cost_s * w["cost"] + time_s * w["time"] + risk_s * w["risk"]
        scored.append((r, composite))

    scored.sort(key=lambda x: x[1], reverse=True)
    best_route, best_score = scored[0]

    # Confidence score (0-100)
    if len(scored) > 1:
        margin = best_score - scored[1][1]
        confidence = min(100, 60 + margin * 200)
    else:
        confidence = 85

    # Build explanation
    explanation = _build_explanation(best_route, routes, buyer_priority, urgency)

    # Cost saving vs cheapest
    cheapest = min(routes, key=lambda r: r["landed_cost"])
    rec_type = best_route.get("route_type", "balanced")
    cost_saving = cheapest["true_cost"] - best_route["true_cost"] if cheapest != best_route else 0
    risk_reduction = (
        best_route["risk_assessment"]["transit_reliability_score"]
        - cheapest["risk_assessment"]["transit_reliability_score"]
    ) if cheapest != best_route else 0

    return {
        "recommended_route_type": rec_type,
        "recommended_route_id": best_route["route_id"],
        "confidence_score": round(confidence, 1),
        "explanation": explanation,
        "cost_saving_vs_cheapest": round(cost_saving, 2),
        "risk_reduction_vs_cheapest": round(risk_reduction, 1),
    }


def _build_explanation(best, routes, priority, urgency):
    cheapest_landed = min(routes, key=lambda r: r["landed_cost"])
    parts = []

    if best["route_id"] != cheapest_landed["route_id"]:
        parts.append(
            f"Although {cheapest_landed['name']} appears cheapest at "
            f"${cheapest_landed['landed_cost']:,.0f}, its hidden risk cost of "
            f"${cheapest_landed['hidden_cost']:,.0f} (from port congestion and "
            f"delay probability of {cheapest_landed['risk_assessment']['delay_probability']*100:.0f}%) "
            f"inflates its true cost to ${cheapest_landed['true_cost']:,.0f}."
        )
        parts.append(
            f"The recommended route ({best['name']}) has a true cost of "
            f"${best['true_cost']:,.0f} with {best['risk_assessment']['transit_reliability_score']:.0f}% "
            f"transit reliability — saving ${cheapest_landed['true_cost'] - best['true_cost']:,.0f} "
            f"in risk-adjusted terms."
        )
    else:
        parts.append(
            f"{best['name']} is both the cheapest and lowest-risk option "
            f"with a true cost of ${best['true_cost']:,.0f} and "
            f"{best['risk_assessment']['transit_reliability_score']:.0f}% reliability."
        )

    if urgency in ("high", "critical"):
        parts.append(f"Given {urgency} urgency, time sensitivity was weighted heavily in this recommendation.")

    parts.append(f"Buyer priority '{priority}' was factored into the scoring model.")
    return " ".join(parts)
