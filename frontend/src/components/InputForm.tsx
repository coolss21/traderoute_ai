"use client";

import { useState } from "react";

interface Props {
  onSubmit: (data: Record<string, unknown>) => void;
  loading: boolean;
}

const PRESETS = [
  {
    id: "preset_1",
    label: "🌏 Asia → India",
    data: { hsn_code: "3923", origin: "Shanghai", destination: "Mumbai", quantity: 5000, invoice_value: 25000, urgency: "medium", buyer_priority: "balance" },
  },
  {
    id: "preset_2",
    label: "🕌 Middle East → India",
    data: { hsn_code: "7108", origin: "Dubai", destination: "Chennai", quantity: 200, invoice_value: 90000, urgency: "high", buyer_priority: "balance" },
  },
  {
    id: "preset_3",
    label: "🇪🇺 Europe → India",
    data: { hsn_code: "8429", origin: "Germany", destination: "Delhi", quantity: 20, invoice_value: 500000, urgency: "low", buyer_priority: "cost" },
  },
  {
    id: "preset_4",
    label: "🇺🇸 USA → India",
    data: { hsn_code: "8471", origin: "Los Angeles", destination: "Mumbai", quantity: 3000, invoice_value: 250000, urgency: "high", buyer_priority: "balance" },
  },
  {
    id: "preset_5",
    label: "🇯🇵 East Asia → India",
    data: { hsn_code: "8517", origin: "Tokyo", destination: "Mumbai", quantity: 3000, invoice_value: 150000, urgency: "medium", buyer_priority: "speed" },
  },
  {
    id: "preset_6",
    label: "🇮🇳 India Domestic",
    data: { hsn_code: "3923", origin: "Mundra", destination: "Chennai", quantity: 10000, invoice_value: 15000, urgency: "low", buyer_priority: "cost" },
  },
];

export default function InputForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState({
    hsn_code: "7108",
    origin: "Dubai",
    destination: "Chennai",
    quantity: 200,
    invoice_value: 90000,
    urgency: "high",
    buyer_priority: "balance",
    simulate_disruption: "",
    presetId: "preset_2",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((p) => {
      const newForm = {
        ...p,
        [name]: name === "quantity" || name === "invoice_value" ? Number(value) : value,
      };
      
      // Auto-submit immediately if the disruption scenario changes
      if (name === "simulate_disruption") {
        setTimeout(() => {
          document.getElementById('analyze-button')?.click();
        }, 10);
      }
      
      return newForm;
    });
  };

  const handlePreset = (id: string, data: Omit<typeof form, "simulate_disruption" | "presetId">) => {
    setForm({ ...form, ...data, presetId: id, simulate_disruption: "" });
    setTimeout(() => {
      document.getElementById('analyze-button')?.click();
    }, 10);
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
              onClick={() => handlePreset(p.id, p.data)}
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
              <option value="China">🇨🇳 China (Shenzhen)</option>
              <option value="Shanghai">🇨🇳 Shanghai</option>
              <option value="Vietnam">🇻🇳 Vietnam</option>
              <option value="Germany">🇩🇪 Germany (Hamburg)</option>
              <option value="Dubai">🇦🇪 Dubai</option>
              <option value="Los Angeles">🇺🇸 Los Angeles</option>
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
              placeholder="e.g. Chennai"
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
