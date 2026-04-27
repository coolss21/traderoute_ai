You are a senior product architect, full-stack engineer, and supply chain domain expert.

Your task is to design and build a COMPLETE, production-grade system called:

"TradeRoute AI — Buyer-Centric Landed Cost, Route Comparison and Risk Intelligence Platform"

This system must strictly follow the concept, structure, and business logic defined below.

DO NOT simplify. DO NOT skip components. Build a real, demo-ready system suitable for a global hackathon and enterprise pitch.

---

🎯 CORE OBJECTIVE

Build a system that allows a BUYER to:

* Input HSN code, origin, destination, and shipment details
* Compare multiple sourcing routes
* See FULL LANDED COST (not just quote price)
* Understand route-level risk
* Receive a RECOMMENDED decision

The system MUST expose:

👉 “True Cost before decision”
👉 NOT just “Cheapest quote”

---

🔥 CORE NOVELTY (MANDATORY)

Implement "Cost Illusion Detection":

* Detect when a route appears cheaper but becomes worse after hidden costs
* Show:

Base Cost

* Hidden Risk Cost
  = True Cost

Highlight:
❌ misleading cheap option
✅ recommended stable option

This is the MAIN differentiator.

---

🧠 SYSTEM MODULES (STRICTLY REQUIRED)

1. BUYER INPUT MODULE

* HSN code
* Origin
* Destination
* Quantity
* Invoice value
* Urgency
* Buyer priority (cost / speed / balance)

---

2. LANDED COST ENGINE

Calculate:

* Supplier invoice value
* Customs duty (BCD)
* IGST
* Surcharge / cess
* Freight cost
* Insurance
* Terminal handling
* Domestic transport
* Warehousing

Output:
👉 Total Landed Cost

---

3. RISK ENGINE

Compute:

* Transit reliability score
* Port congestion impact
* Delay probability
* Expected delay days

Hidden Cost formula:

hidden_cost =
(delay_probability × expected_delay_days × business_impact_per_day)

* congestion_penalty
* fallback_buffer

---

4. TRUE COST ENGINE

true_cost = landed_cost + hidden_cost

---

5. ROUTE ENGINE

Generate 3 route types:

* Cheapest
* Fastest
* Balanced

Each route must include:

* Path (e.g., China → Mumbai → Pune)
* Transit days
* Cost breakdown
* Risk score
* Reliability

---

6. RECOMMENDATION ENGINE

Select best route based on:

* Buyer priority
* Risk-adjusted cost
* Time sensitivity

Output:

* Recommended route
* Confidence score
* Explanation:

Example:
“Although Option A is cheaper upfront, congestion risk increases total cost beyond Option B.”

---

💻 TECH STACK (MANDATORY)

Frontend:

* Next.js
* Tailwind CSS
* Recharts for visualization

Backend:

* FastAPI (Python)

Database:

* PostgreSQL

Deployment:

* Vercel (frontend)
* Railway / Render (backend)

---

📊 FRONTEND UI REQUIREMENTS

Single-page dashboard with:

1. Input form

2. Result cards:

   * Cheapest
   * Fastest
   * Balanced
   * Recommended ⭐

3. Comparison table:

   * Base cost
   * Hidden cost
   * True cost
   * Transit days
   * Risk

4. Chart (CRITICAL):

   * Base cost vs True cost (bar chart)

5. Explanation panel:
   “Why this route is recommended”

---

🏗️ SYSTEM ARCHITECTURE (MUST IMPLEMENT)

Data Sources:

* HSN tariff data
* Supplier quotes
* Logistics routes
* Risk signals (mock if needed)

Processing Layer:

* Data normalization
* API ingestion

Core Engine:

* Cost engine
* Risk engine
* Route engine
* Recommendation engine

Output Layer:

* Dashboard
* API endpoints
* Reports

---

📦 API DESIGN

POST /analyze

Input:
{
hsn_code,
origin,
destination,
quantity,
invoice_value,
urgency,
buyer_priority
}

Output:

* routes[]
* recommendation{}
* explanation

---

📈 DEMO SCENARIO (MANDATORY)

Use:

HSN: 3923
Route:

* China → Mumbai → Pune (cheapest but risky)
* China → Chennai → Pune (recommended)
* Air option (fastest)

Ensure:
👉 Cheapest is NOT recommended
👉 Recommended is logically justified

---

🎯 BUSINESS IMPACT (SHOW IN UI OR DOC)

* Better procurement decisions
* Reduced hidden costs
* Improved supply chain reliability
* Strong audit trail

---

🚀 MVP BUILD PLAN

Phase 1:

* Mock data
* Core APIs
* Basic UI

Phase 2:

* Full comparison logic
* Risk modeling

Phase 3:

* Deployment + demo

---

📊 OUTPUT REQUIREMENTS

You must generate:

1. Full backend code (FastAPI)
2. Full frontend code (Next.js)
3. Seed dataset (JSON/CSV)
4. Working API endpoints
5. UI with charts and comparison
6. Deployment instructions
7. README with setup steps

---

⚠️ CRITICAL RULES

* Do NOT use placeholder logic
* Do NOT skip hidden cost logic
* Do NOT simplify architecture
* Do NOT remove recommendation explanation

Everything must be:
👉 Working
👉 Clean
👉 Demo-ready

---

🎯 FINAL GOAL

Create a system that makes judges say:

“Wait… this shows the REAL cost before decision?”

That is the success criteria.

Now build the COMPLETE system.
