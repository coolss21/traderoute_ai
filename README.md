# TradeRoute AI — Buyer-Centric Landed Cost & Risk Intelligence Platform

TradeRoute AI is a production-grade supply chain intelligence platform designed to uncover the **True Landed Cost** of international shipments. By combining base logistics costs with dynamically calculated hidden risk costs (e.g., transit delays, port congestion), it helps buyers make fully informed, risk-adjusted sourcing decisions.

## 🔥 Core Novelty: Cost Illusion Detection

The system actively detects "Cost Illusions"—scenarios where a route appears to be the cheapest option upfront but becomes significantly more expensive when hidden risks and delays are factored in.

*   **Base Cost:** Supplier Invoice + Customs + Freight + Insurance + Handling + Transport + Warehousing
*   **Hidden Risk Cost:** Delay Probability × Expected Delay Days × Business Impact + Congestion Penalty + Fallback Buffer
*   **True Cost:** Base Cost + Hidden Risk Cost

The dashboard explicitly highlights misleadingly cheap options and justifies its AI-driven recommendations.

---

## 🏗️ System Architecture

*   **Frontend:** Next.js, React, Tailwind CSS, Recharts (Vercel ready)
*   **Backend:** FastAPI, Pydantic, Uvicorn (Render/Railway ready)
*   **Data Models:** HSN Tariffs, Route Libraries, Risk Signals (Mocked for Demo)

---

## 🚀 Getting Started (Local Development)

### Prerequisites

*   Python 3.9+
*   Node.js 18+

### 1. Start the Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

*   The API will be available at: `http://localhost:8000`
*   Swagger documentation: `http://localhost:8000/docs`

### 2. Start the Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

*   The dashboard will be available at: `http://localhost:3000`

---

## 📈 Demo Scenario

To see the platform's core differentiator in action:

1.  Open the dashboard.
2.  Click the **🎯 Demo: Plastics from China → Pune** preset button, or manually enter:
    *   **HSN Code:** 3923
    *   **Origin:** China
    *   **Destination:** Pune
    *   **Quantity:** 5000
    *   **Invoice Value:** 25000
    *   **Urgency:** Medium
    *   **Buyer Priority:** Balanced
3.  Click **Analyze Routes**.

**What you will observe:**

*   **Sea via Mumbai** will have the lowest *Base Cost* but a very high *Hidden Cost* due to port congestion. It will be flagged as a **❌ Cost Illusion**.
*   **Sea via Chennai** will be **⭐ Recommended** because its lower risk profile results in a lower *True Cost*, despite having a slightly higher initial quote.

---

## 📦 Deployment Instructions

### Backend (Railway / Render)

1.  Connect your GitHub repository to Render/Railway.
2.  Set the root directory to `backend`.
3.  **Build Command:** `pip install -r requirements.txt`
4.  **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel)

1.  Import your GitHub repository into Vercel.
2.  Set the Framework Preset to **Next.js**.
3.  Set the Root Directory to `frontend`.
4.  **Build Command:** `npm run build`
5.  In the Vercel dashboard, make sure the API requests are routing correctly, or update `next.config.js` with your deployed backend URL.

---

## 🎯 Business Impact

*   **Better Procurement Decisions:** Avoid routes that look cheap but fail.
*   **Reduced Hidden Costs:** Factor in delay penalties before signing contracts.
*   **Improved Supply Chain Reliability:** Source through stable nodes.
*   **Strong Audit Trail:** Document exactly why a specific route was chosen.
