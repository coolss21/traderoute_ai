"""
Landed Cost Engine
Calculates the full landed cost of goods including customs duties,
taxes, freight, insurance, handling, transport, and warehousing.
"""
from __future__ import annotations
import json
import os
from typing import Dict, Any

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


def _load_tariffs() -> Dict[str, Any]:
    with open(os.path.join(DATA_DIR, "hsn_tariffs.json"), "r") as f:
        return json.load(f)["tariffs"]


def get_tariff_info(hsn_code: str) -> Dict[str, Any]:
    """Return tariff info for an HSN code, with fallback defaults."""
    tariffs = _load_tariffs()
    # Try exact match, then prefix match
    if hsn_code in tariffs:
        return tariffs[hsn_code]
    for code, info in tariffs.items():
        if hsn_code.startswith(code) or code.startswith(hsn_code):
            return info
    # Default fallback
    return {
        "description": f"Product HSN {hsn_code}",
        "bcd_rate": 10.0,
        "igst_rate": 18.0,
        "social_welfare_surcharge_rate": 10.0,
        "anti_dumping_duty": 0.0,
        "safeguard_duty": 0.0,
    }


def calculate_landed_cost(
    invoice_value: float,
    quantity: int,
    hsn_code: str,
    route_data: Dict[str, Any],
    weight_per_unit_kg: float = 0.5,
) -> Dict[str, float]:
    """
    Compute every component of the landed cost.

    Parameters
    ----------
    invoice_value : float
        Total supplier invoice value (CIF concept).
    quantity : int
        Number of units.
    hsn_code : str
        HSN tariff heading.
    route_data : dict
        Logistics route parameters (freight rates, handling, etc.).
    weight_per_unit_kg : float
        Estimated weight per unit for freight calculation.

    Returns
    -------
    dict  with each cost line and `total_landed_cost`.
    """
    tariff = get_tariff_info(hsn_code)
    total_weight = quantity * weight_per_unit_kg

    # ── Freight ──────────────────────────────────────────────────────
    freight_cost = max(
        route_data["freight_rate_per_kg"] * total_weight,
        route_data["min_freight"],
    )

    # ── Insurance ────────────────────────────────────────────────────
    insurance = (invoice_value + freight_cost) * route_data["insurance_rate"]

    # ── Assessable value for customs ────────────────────────────────
    assessable_value = invoice_value + freight_cost + insurance

    # ── Basic Customs Duty (BCD) ─────────────────────────────────────
    bcd_rate = tariff["bcd_rate"] / 100.0
    customs_duty_bcd = assessable_value * bcd_rate

    # ── Social Welfare Surcharge on BCD ─────────────────────────────
    sws_rate = tariff["social_welfare_surcharge_rate"] / 100.0
    surcharge_cess = customs_duty_bcd * sws_rate

    # ── Anti-dumping + Safeguard (if any) ────────────────────────────
    anti_dumping = assessable_value * (tariff.get("anti_dumping_duty", 0) / 100.0)
    safeguard = assessable_value * (tariff.get("safeguard_duty", 0) / 100.0)
    surcharge_cess += anti_dumping + safeguard

    # ── IGST (on assessable + BCD + surcharge) ──────────────────────
    igst_base = assessable_value + customs_duty_bcd + surcharge_cess
    igst_rate = tariff["igst_rate"] / 100.0
    igst = igst_base * igst_rate

    # ── Terminal Handling ────────────────────────────────────────────
    terminal_handling = route_data["terminal_handling"]

    # ── Domestic Transport ───────────────────────────────────────────
    domestic_transport = route_data["domestic_transport"]

    # ── Warehousing ──────────────────────────────────────────────────
    warehousing = route_data["warehousing_per_day"] * route_data["warehousing_days"]

    # ── Total ────────────────────────────────────────────────────────
    total_landed_cost = (
        invoice_value
        + customs_duty_bcd
        + igst
        + surcharge_cess
        + freight_cost
        + insurance
        + terminal_handling
        + domestic_transport
        + warehousing
    )

    return {
        "supplier_invoice": round(invoice_value, 2),
        "customs_duty_bcd": round(customs_duty_bcd, 2),
        "igst": round(igst, 2),
        "surcharge_cess": round(surcharge_cess, 2),
        "freight_cost": round(freight_cost, 2),
        "insurance": round(insurance, 2),
        "terminal_handling": round(terminal_handling, 2),
        "domestic_transport": round(domestic_transport, 2),
        "warehousing": round(warehousing, 2),
        "total_landed_cost": round(total_landed_cost, 2),
    }
