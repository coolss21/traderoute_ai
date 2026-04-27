"""
Pydantic models for TradeRoute AI request/response schemas.
"""
from __future__ import annotations
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


# ── Enums ───────────────────────────────────────────────────────────────
class BuyerPriority(str, Enum):
    COST = "cost"
    SPEED = "speed"
    BALANCE = "balance"


class Urgency(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class RouteType(str, Enum):
    CHEAPEST = "cheapest"
    FASTEST = "fastest"
    BALANCED = "balanced"
    CHINA = "china"
    VIETNAM = "vietnam"
    GERMANY = "germany"
    USA = "usa"
    TURKEY = "turkey"
    BANGLADESH = "bangladesh"
    SOUTH_KOREA = "south korea"
    TAIWAN = "taiwan"


# ── Request ─────────────────────────────────────────────────────────────
class AnalyzeRequest(BaseModel):
    hsn_code: str = Field(..., description="HSN/HS tariff code", examples=["3923"])
    origin: str = Field(..., description="Origin country/city", examples=["China"])
    destination: str = Field(..., description="Destination city", examples=["Pune"])
    quantity: int = Field(..., ge=1, description="Number of units")
    invoice_value: float = Field(..., gt=0, description="Supplier invoice value in USD")
    urgency: Urgency = Field(default=Urgency.MEDIUM)
    buyer_priority: BuyerPriority = Field(default=BuyerPriority.BALANCE)
    simulate_disruption: Optional[str] = Field(None, description="Disruption scenario (e.g. 'typhoon', 'war')")


# ── Cost Breakdown ──────────────────────────────────────────────────────
class CostBreakdown(BaseModel):
    supplier_invoice: float = Field(..., description="Base supplier invoice value")
    customs_duty_bcd: float = Field(..., description="Basic Customs Duty")
    igst: float = Field(..., description="Integrated GST")
    surcharge_cess: float = Field(..., description="Social welfare surcharge / cess")
    freight_cost: float = Field(..., description="International freight")
    insurance: float = Field(..., description="Cargo insurance")
    terminal_handling: float = Field(..., description="Port terminal handling charges")
    domestic_transport: float = Field(..., description="Last-mile domestic transport")
    warehousing: float = Field(..., description="Warehousing & storage")
    total_landed_cost: float = Field(..., description="Sum of all cost components")


# ── Risk Assessment ─────────────────────────────────────────────────────
class RiskAssessment(BaseModel):
    transit_reliability_score: float = Field(..., ge=0, le=100)
    port_congestion_impact: float = Field(..., ge=0, le=1, description="0-1 scale")
    delay_probability: float = Field(..., ge=0, le=1, description="Probability of delay")
    expected_delay_days: float = Field(..., ge=0)
    congestion_penalty: float = Field(..., ge=0, description="Added cost from congestion")
    fallback_buffer: float = Field(..., ge=0, description="Buffer for contingency")
    hidden_cost: float = Field(..., description="Computed hidden risk cost")
    risk_level: str = Field(..., description="low / medium / high / critical")
    active_disruption: Optional[str] = Field(None, description="Active disruption event")
    disrupted_nodes: List[str] = Field(default_factory=list, description="Countries/Ports affected")


# ── Timeline Step ───────────────────────────────────────────────────────
class TimelineStep(BaseModel):
    title: str
    location: str
    duration_days: int
    icon: str

# ── Route ───────────────────────────────────────────────────────────────
class Route(BaseModel):
    route_type: RouteType
    path: List[str] = Field(..., description="Ordered waypoints")
    mode: str = Field(..., description="Transport mode: sea, air, multimodal")
    transit_days: int
    cost_breakdown: CostBreakdown
    risk_assessment: RiskAssessment
    true_cost: float = Field(..., description="landed_cost + hidden_cost")
    is_recommended: bool = False
    is_cost_illusion: bool = Field(
        False,
        description="True if this route appears cheap but has high true cost",
    )
    cost_illusion_warning: Optional[str] = None
    co2_emissions_kg: float = 0.0
    is_greenest: bool = False
    timeline: List[TimelineStep] = Field(default_factory=list)


# ── Recommendation ──────────────────────────────────────────────────────
class Recommendation(BaseModel):
    recommended_route_type: RouteType
    confidence_score: float = Field(..., ge=0, le=100)
    explanation: str
    cost_saving_vs_cheapest: Optional[float] = None
    risk_reduction_vs_cheapest: Optional[float] = None


# ── Business Impact ─────────────────────────────────────────────────────
class BusinessImpact(BaseModel):
    potential_savings: float
    risk_reduction_pct: float
    decision_confidence: str
    audit_trail: List[str]


# ── Full Response ───────────────────────────────────────────────────────
class AnalyzeResponse(BaseModel):
    hsn_code: str
    origin: str
    destination: str
    quantity: int
    invoice_value: float
    routes: List[Route]
    recommendation: Recommendation
    business_impact: BusinessImpact
