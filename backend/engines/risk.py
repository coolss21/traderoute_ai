"""
Risk Engine
Computes transit reliability, delay probability, port congestion impact,
and the hidden cost formula.
"""
from __future__ import annotations
import json
import os
import math
from typing import Dict, Any

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


def _load_risk_signals() -> Dict[str, Any]:
    with open(os.path.join(DATA_DIR, "risk_signals.json"), "r") as f:
        return json.load(f)


def compute_risk(
    origin: str,
    port_name: str,
    mode: str,
    transit_days: int,
    invoice_value: float,
    urgency: str,
    simulate_disruption: str = None,
    route_path: list = None,
) -> Dict[str, Any]:
    """
    Full risk assessment for a route.
    """
    signals = _load_risk_signals()

    # ── Port congestion ─────────────────────────────────────────────
    port_info = signals["port_congestion"].get(
        port_name,
        {"congestion_score": 0.30, "avg_delay_days": 1.5, "peak_season_multiplier": 1.1},
    )
    congestion_score = port_info["congestion_score"]
    avg_delay = port_info["avg_delay_days"]
    peak_mult = port_info.get("peak_season_multiplier", 1.0)

    # ── Transit reliability ─────────────────────────────────────────
    origin_key = _resolve_origin_key(origin)
    mode_key = "air" if mode == "air" else "sea"
    reliability_data = (
        signals["transit_reliability"]
        .get(mode_key, {})
        .get(origin_key, {"on_time_pct": 75, "avg_deviation_days": 2.0})
    )
    on_time_pct = reliability_data["on_time_pct"]
    avg_deviation = reliability_data["avg_deviation_days"]

    active_disruption = None
    disrupted_nodes = []

    # Check all nodes in the path for disruptions, or just origin + port if no path provided
    nodes_to_check = route_path if route_path else [origin, port_name]
    combined = " ".join([str(n).lower() for n in nodes_to_check])
    
    if simulate_disruption == "typhoon":
        typhoon_zones = {
            "china": "China", "vietnam": "Vietnam", "taiwan": "Taiwan",
            "south korea": "South Korea", "shenzhen": "Shenzhen Port",
            "shanghai": "Shanghai Port", "hong kong": "Hong Kong",
            "guangzhou": "Guangzhou Port", "ningbo": "Ningbo Port",
        }
        hits = [label for key, label in typhoon_zones.items() if key in combined]
        if hits:
            active_disruption = "Typhoon in South China Sea — severe port congestion, vessel diversions, and airspace restrictions across East & Southeast Asia"
            disrupted_nodes = list(dict.fromkeys(hits))  # deduplicate, preserve order
            congestion_score = 0.95
            avg_delay += 12.0
            on_time_pct = min(on_time_pct, 15.0)
            avg_deviation += 8.0
    elif simulate_disruption == "war":
        war_zones = {
            "turkey": "Turkey", "istanbul": "Istanbul Port",
            "germany": "Germany", "hamburg": "Hamburg Port",
            "usa": "USA", "los angeles": "Los Angeles Port",
            "new york": "New York Port", "jebel ali": "Jebel Ali (Dubai)",
            "hormuz": "Strait of Hormuz", "suez": "Suez Canal",
        }
        hits = [label for key, label in war_zones.items() if key in combined]
        if hits:
            active_disruption = "USA-Iran Conflict — Strait of Hormuz closure, Middle East airspace restrictions, NATO-allied port security escalation"
            disrupted_nodes = list(dict.fromkeys(hits))
            congestion_score = 0.98
            avg_delay += 18.0
            on_time_pct = min(on_time_pct, 5.0)
            avg_deviation += 14.0

    # ── Delay probability ───────────────────────────────────────────
    # Combines port congestion + transit unreliability
    base_delay_prob = 1.0 - (on_time_pct / 100.0)
    delay_probability = min(
        1.0,
        base_delay_prob + (congestion_score * 0.3),
    )

    # ── Expected delay days ─────────────────────────────────────────
    expected_delay_days = (avg_delay * peak_mult + avg_deviation) * delay_probability

    # ── Business impact per day ─────────────────────────────────────
    biz_impact = signals["business_impact_per_day"].get(urgency, 150)

    # ── Hidden Cost Formula ─────────────────────────────────────────
    congestion_penalty = congestion_score * invoice_value * 0.02
    fallback_buffer = _compute_fallback_buffer(delay_probability, invoice_value)

    hidden_cost = (
        (delay_probability * expected_delay_days * biz_impact)
        + congestion_penalty
        + fallback_buffer
    )

    # ── Transit reliability score (0-100) ───────────────────────────
    transit_reliability_score = max(0, min(100, (
        on_time_pct * 0.5
        + (1 - congestion_score) * 100 * 0.3
        + (1 - delay_probability) * 100 * 0.2
    )))

    # ── Risk level ──────────────────────────────────────────────────
    risk_level = _classify_risk(delay_probability, congestion_score, expected_delay_days)

    return {
        "transit_reliability_score": round(transit_reliability_score, 1),
        "port_congestion_impact": round(congestion_score, 3),
        "delay_probability": round(delay_probability, 3),
        "expected_delay_days": round(expected_delay_days, 1),
        "congestion_penalty": round(congestion_penalty, 2),
        "fallback_buffer": round(fallback_buffer, 2),
        "hidden_cost": round(hidden_cost, 2),
        "risk_level": risk_level,
        "active_disruption": active_disruption,
        "disrupted_nodes": disrupted_nodes,
    }


def _resolve_origin_key(origin: str) -> str:
    """Map origin name to the key used in risk_signals transit_reliability."""
    origin_lower = origin.lower()
    if "china" in origin_lower or "shenzhen" in origin_lower or "shanghai" in origin_lower:
        return "China-India"
    if "vietnam" in origin_lower or "ho chi minh" in origin_lower:
        return "Vietnam-India"
    return "China-India"  # default


def _compute_fallback_buffer(delay_probability: float, invoice_value: float) -> float:
    """
    Fallback buffer: extra safety margin proportional to risk.
    Uses a non-linear curve so high-risk routes get disproportionately penalized.
    """
    risk_factor = math.pow(delay_probability, 0.8)  # sub-linear scaling
    return invoice_value * risk_factor * 0.015  # up to 1.5% of invoice


def _classify_risk(
    delay_probability: float,
    congestion_score: float,
    expected_delay_days: float,
) -> str:
    """Classify overall risk level."""
    composite = (delay_probability * 0.4 + congestion_score * 0.35 + min(expected_delay_days / 10, 1) * 0.25)
    if composite >= 0.65:
        return "critical"
    if composite >= 0.45:
        return "high"
    if composite >= 0.25:
        return "medium"
    return "low"
