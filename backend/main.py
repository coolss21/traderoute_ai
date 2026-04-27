"""
TradeRoute AI — FastAPI Backend
Main application with /analyze endpoint and health check.
"""
from __future__ import annotations
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models.schemas import (
    AnalyzeRequest, AnalyzeResponse, Route, CostBreakdown,
    RiskAssessment, Recommendation, BusinessImpact, RouteType,
)
from engines.route import generate_routes, classify_routes
from engines.true_cost import detect_cost_illusion
from engines.recommendation import generate_recommendation

app = FastAPI(
    title="TradeRoute AI",
    description="Buyer-Centric Landed Cost, Route Comparison & Risk Intelligence Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health():
    return {"status": "ok", "service": "TradeRoute AI", "version": "1.0.0"}

@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    try:
        # 1. Generate routes with full cost & risk
        raw_routes = generate_routes(
            origin=req.origin, destination=req.destination,
            hsn_code=req.hsn_code, quantity=req.quantity,
            invoice_value=req.invoice_value, urgency=req.urgency.value,
            simulate_disruption=req.simulate_disruption,
        )
        # 2. Classify as cheapest/fastest/balanced
        classified = classify_routes(raw_routes)
        # 3. Cost Illusion Detection
        with_illusion = detect_cost_illusion(classified)
        # 4. Recommendation
        rec_data = generate_recommendation(with_illusion, req.buyer_priority.value, req.urgency.value)

        # Mark recommended route and greenest route
        min_co2 = min(r.get("co2_emissions_kg", 999999) for r in with_illusion)
        for r in with_illusion:
            r["is_recommended"] = (r["route_id"] == rec_data["recommended_route_id"])
            if r.get("co2_emissions_kg", 999999) == min_co2:
                r["is_greenest"] = True

        # Build response objects
        route_models = []
        for r in with_illusion:
            route_models.append(Route(
                route_type=RouteType(r["route_type"]),
                path=r["path"], mode=r["mode"], transit_days=r["transit_days"],
                cost_breakdown=CostBreakdown(**r["cost_breakdown"]),
                risk_assessment=RiskAssessment(**r["risk_assessment"]),
                true_cost=r["true_cost"],
                is_recommended=r.get("is_recommended", False),
                is_cost_illusion=r.get("is_cost_illusion", False),
                cost_illusion_warning=r.get("cost_illusion_warning"),
                co2_emissions_kg=r.get("co2_emissions_kg", 0.0),
                is_greenest=r.get("is_greenest", False),
                timeline=r.get("timeline", []),
            ))

        rec_model = Recommendation(
            recommended_route_type=RouteType(rec_data["recommended_route_type"]),
            confidence_score=rec_data["confidence_score"],
            explanation=rec_data["explanation"],
            cost_saving_vs_cheapest=rec_data.get("cost_saving_vs_cheapest"),
            risk_reduction_vs_cheapest=rec_data.get("risk_reduction_vs_cheapest"),
        )

        # Business impact
        cheapest_tc = min(r.true_cost for r in route_models)
        recommended_route = next((r for r in route_models if r.is_recommended), route_models[0])
        savings = max(0, min(r.true_cost for r in route_models if r.is_cost_illusion) - recommended_route.true_cost) if any(r.is_cost_illusion for r in route_models) else 0

        biz = BusinessImpact(
            potential_savings=round(savings, 2),
            risk_reduction_pct=round(rec_data.get("risk_reduction_vs_cheapest", 0), 1),
            decision_confidence=f"{rec_data['confidence_score']}%",
            audit_trail=[
                f"HSN {req.hsn_code} tariff rates applied",
                f"3 routes evaluated: {', '.join(r.mode for r in route_models)}",
                f"Risk signals from {len(set(r.path[-2] for r in route_models))} ports analyzed",
                f"Cost illusion detection: {sum(1 for r in route_models if r.is_cost_illusion)} route(s) flagged",
                f"Recommendation engine: priority={req.buyer_priority.value}, urgency={req.urgency.value}",
            ],
        )

        return AnalyzeResponse(
            hsn_code=req.hsn_code, origin=req.origin, destination=req.destination,
            quantity=req.quantity, invoice_value=req.invoice_value,
            routes=route_models, recommendation=rec_model, business_impact=biz,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
