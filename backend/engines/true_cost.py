"""
True Cost Engine
Combines landed cost and hidden risk cost to produce the True Cost.
Implements Cost Illusion Detection.
"""
from __future__ import annotations
from typing import Dict, Any, List


def compute_true_cost(
    landed_cost: float,
    hidden_cost: float,
) -> float:
    """true_cost = landed_cost + hidden_cost"""
    return round(landed_cost + hidden_cost, 2)


def detect_cost_illusion(routes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Cost Illusion Detection — the core differentiator.

    A route is a "cost illusion" when:
    1. It has the lowest base/landed cost among all routes, AND
    2. Its true cost is NOT the lowest (hidden costs push it above another route).

    Also flags when a route's hidden cost as a percentage of landed cost
    exceeds 8% — indicating significant hidden risk regardless of ranking.

    Returns the routes list with `is_cost_illusion` and `cost_illusion_warning`
    fields populated.
    """
    if not routes:
        return routes

    # Sort by landed cost to find cheapest
    sorted_by_landed = sorted(routes, key=lambda r: r["landed_cost"])
    cheapest_landed = sorted_by_landed[0]
    cheapest_landed_value = cheapest_landed["landed_cost"]

    # Sort by true cost to find actual cheapest
    sorted_by_true = sorted(routes, key=lambda r: r["true_cost"])
    cheapest_true = sorted_by_true[0]

    for route in routes:
        landed = route["landed_cost"]
        true = route["true_cost"]
        hidden = route["hidden_cost"]
        hidden_pct = (hidden / landed * 100) if landed > 0 else 0

        is_illusion = False
        warning = None

        # Primary illusion: cheapest landed but NOT cheapest true
        if (
            landed == cheapest_landed_value
            and true > cheapest_true["true_cost"]
        ):
            is_illusion = True
            extra = true - cheapest_true["true_cost"]
            warning = (
                f"⚠️ Cost Illusion Detected: This route appears ${landed:,.0f} "
                f"(cheapest upfront), but hidden costs of ${hidden:,.0f} push the "
                f"true cost to ${true:,.0f} — ${extra:,.0f} MORE than the actual "
                f"best option via {cheapest_true['path'][-2]}."
            )

        # Secondary illusion: any route with high hidden cost ratio
        elif hidden_pct > 8.0 and not is_illusion:
            is_illusion = True
            warning = (
                f"⚠️ High Hidden Cost: {hidden_pct:.1f}% of the landed cost "
                f"(${hidden:,.0f}) is hidden risk cost — port congestion and "
                f"delay penalties significantly inflate the true cost."
            )

        route["is_cost_illusion"] = is_illusion
        route["cost_illusion_warning"] = warning

    return routes
