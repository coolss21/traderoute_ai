"use client";

import { useState } from "react";

interface Props {
  onSubmit: (data: Record<string, unknown>) => void;
  loading: boolean;
}

const PRESETS = [
  // ── Asia → India ──────────────────────────────────────────────────────────
  {
    label: "🇨🇳 China → Pune",
    data: { hsn_code: "3923", origin: "China", destination: "Pune", quantity: 5000, invoice_value: 25000, urgency: "medium", buyer_priority: "balance" },
  },
  {
    label: "🇨🇳 Shanghai → Delhi (Hormuz)",
    data: { hsn_code: "8517", origin: "Shanghai", destination: "Delhi", quantity: 3000, invoice_value: 200000, urgency: "critical", buyer_priority: "speed" },
  },
  {
    label: "🇻🇳 Vietnam → Mumbai",
    data: { hsn_code: "6110", origin: "Vietnam", destination: "Mumbai", quantity: 12000, invoice_value: 55000, urgency: "low", buyer_priority: "cost" },
  },
  {
    label: "🇸🇬 Singapore → Pune",
    data: { hsn_code: "8471", origin: "Singapore", destination: "Pune", quantity: 2000, invoice_value: 80000, urgency: "high", buyer_priority: "speed" },
  },
  {
    label: "🇯🇵 Japan → Delhi",
    data: { hsn_code: "8703", origin: "Japan", destination: "Delhi", quantity: 500, invoice_value: 350000, urgency: "high", buyer_priority: "speed" },
  },
  {
    label: "🇰🇷 Korea → Mumbai",
    data: { hsn_code: "8542", origin: "Korea", destination: "Mumbai", quantity: 1000, invoice_value: 120000, urgency: "medium", buyer_priority: "balance" },
  },
  // ── Europe → India ─────────────────────────────────────────────────────────
  {
    label: "🇩🇪 Germany → Delhi (Suez)",
    data: { hsn_code: "8429", origin: "Germany", destination: "Delhi", quantity: 20, invoice_value: 500000, urgency: "low", buyer_priority: "cost" },
  },
  {
    label: "🇳🇱 Rotterdam → Mumbai",
    data: { hsn_code: "2710", origin: "Rotterdam", destination: "Mumbai", quantity: 50000, invoice_value: 180000, urgency: "medium", buyer_priority: "cost" },
  },
  // ── Middle East → India ────────────────────────────────────────────────────
  {
    label: "🇦🇪 Dubai → Pune",
    data: { hsn_code: "7108", origin: "Dubai", destination: "Pune", quantity: 200, invoice_value: 900000, urgency: "critical", buyer_priority: "speed" },
  },
  // ── USA → India ────────────────────────────────────────────────────────────
  {
    label: "🇺🇸 Los Angeles → Mumbai",
    data: { hsn_code: "8471", origin: "Los Angeles", destination: "Mumbai", quantity: 3000, invoice_value: 250000, urgency: "high", buyer_priority: "balance" },
  },
  // ── Southeast Asia → India ─────────────────────────────────────────────────
  {
    label: "🇹🇭 Bangkok → Pune",
    data: { hsn_code: "4011", origin: "Bangkok", destination: "Pune", quantity: 8000, invoice_value: 40000, urgency: "medium", buyer_priority: "cost" },
  },
  // ── Auto-Detect ────────────────────────────────────────────────────────────
  {
    label: "🌍 Global → Delhi",
    data: { hsn_code: "8517", origin: "Global Auto-Detect", destination: "Delhi", quantity: 2000, invoice_value: 150000, urgency: "high", buyer_priority: "speed" },
  },
];

export default function InputForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState({
    hsn_code: "3923",
    origin: "Global Auto-Detect",
    destination: "Pune",
    quantity: 5000,
    invoice_value: 25000,
    urgency: "medium",
    buyer_priority: "balance",
    simulate_disruption: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({
      ...p,
      [name]:
        name === "quantity" || name === "invoice_value" ? Number(value) : value,
    }));
  };

  const handlePreset = (data: Omit<typeof form, "simulate_disruption">) => {
    setForm({ ...data, simulate_disruption: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      simulate_disruption: form.simulate_disruption || null,
    };
    onSubmit(payload);
  };

  return (
    <div className="glass-card p-8 mt-8 border border-red-500/0 transition-all duration-500 hover:border-white/10" style={{ borderColor: form.simulate_disruption ? "rgba(239, 68, 68, 0.3)" : undefined }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-3">
            Shipment Analysis
            {form.simulate_disruption && (
              <span className="text-[10px] uppercase tracking-widest font-bold bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30 animate-pulse">
                Live Disruption Active
              </span>
            )}
          </h2>
          <p className="text-sm text-white/40 mt-1">
            Enter details to compare routes and uncover hidden costs
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => handlePreset(p.data)}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white/60
                         hover:bg-white/[0.1] hover:text-white hover:border-white/[0.15] transition-all duration-200"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
              HSN Code
            </label>
            <input
              id="hsn-code"
              name="hsn_code"
              value={form.hsn_code}
              onChange={handleChange}
              className="input-field font-mono"
              placeholder="e.g. 3923"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
              Sourcing Origin
            </label>
            <select
              id="origin"
              name="origin"
              value={form.origin}
              onChange={handleChange}
              className="select-field text-brand-300 font-semibold"
            >
              <option value="Global Auto-Detect">🌍 Global Auto-Detect</option>
              <optgroup label="East Asia">
                <option value="China">🇨🇳 China (Shenzhen)</option>
                <option value="Shanghai">🇨🇳 Shanghai</option>
                <option value="Japan">🇯🇵 Japan (Tokyo)</option>
                <option value="Korea">🇰🇷 South Korea (Seoul)</option>
              </optgroup>
              <optgroup label="Southeast Asia">
                <option value="Vietnam">🇻🇳 Vietnam (Ho Chi Minh)</option>
                <option value="Bangkok">🇹🇭 Thailand (Bangkok)</option>
                <option value="Singapore">🇸🇬 Singapore</option>
              </optgroup>
              <optgroup label="Europe">
                <option value="Germany">🇩🇪 Germany (Hamburg)</option>
                <option value="Rotterdam">🇳🇱 Netherlands (Rotterdam)</option>
              </optgroup>
              <optgroup label="Middle East">
                <option value="Dubai">🇦🇪 UAE (Dubai)</option>
              </optgroup>
              <optgroup label="Americas">
                <option value="Los Angeles">🇺🇸 USA (Los Angeles)</option>
              </optgroup>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
              Destination
            </label>
            <input
              id="destination"
              name="destination"
              value={form.destination}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. Pune"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
              Quantity
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              value={form.quantity}
              onChange={handleChange}
              className="input-field"
              min={1}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
              Invoice Value (USD)
            </label>
            <input
              id="invoice-value"
              name="invoice_value"
              type="number"
              value={form.invoice_value}
              onChange={handleChange}
              className="input-field"
              min={1}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
              Urgency
            </label>
            <select
              id="urgency"
              name="urgency"
              value={form.urgency}
              onChange={handleChange}
              className="select-field"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider">
              Buyer Priority
            </label>
            <select
              id="buyer-priority"
              name="buyer_priority"
              value={form.buyer_priority}
              onChange={handleChange}
              className="select-field"
            >
              <option value="cost">💰 Lowest Cost</option>
              <option value="speed">⚡ Fastest Delivery</option>
              <option value="balance">⚖️ Balanced</option>
            </select>
          </div>
          <div className="flex flex-col justify-end">
            <label className="block text-xs font-medium text-white/50 mb-1.5 uppercase tracking-wider text-red-400">
              Simulation Scenario
            </label>
            <select
              name="simulate_disruption"
              value={form.simulate_disruption}
              onChange={handleChange}
              className="select-field mb-3 border-red-500/20 text-red-400 bg-red-500/5"
            >
              <option value="">None (Normal Ops)</option>
              <option value="typhoon">Typhoon (South China Sea)</option>
              <option value="war">USA-Iran War (Middle East)</option>
            </select>
            <button
              id="analyze-button"
              type="submit"
              disabled={loading}
              className={`btn-primary w-full flex items-center justify-center gap-2 ${form.simulate_disruption ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' : ''}`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Analyzing…
                </>
              ) : (
                <>🔍 Analyze Routes</>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
