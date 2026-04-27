"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import InputForm from "@/components/InputForm";
import RouteCards from "@/components/RouteCards";
import RouteComparison from "@/components/RouteComparison";
import CostChart from "@/components/CostChart";
import GlobeMap from "@/components/GlobeMap";
import ExplanationPanel from "@/components/ExplanationPanel";
import BusinessImpactPanel from "@/components/BusinessImpactPanel";
import Header from "@/components/Header";
import AnalysisLoader from "@/components/AnalysisLoader";
import ScenarioSimulator from "@/components/ScenarioSimulator";
import ExportButton from "@/components/ExportButton";
import type { AnalyzeResponse } from "@/types";

export default function Home() {
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredRoute, setHoveredRoute] = useState<string | null>(null);

  const handleAnalyze = async (formData: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Analysis failed");
      }
      const result: AnalyzeResponse = await res.json();
      setData(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Ambient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-brand-500/5 rounded-full blur-[150px]" />
      </div>

      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Input Section */}
        <section id="input-section" className="mb-12 animate-fade-in">
          <InputForm onSubmit={handleAnalyze} loading={loading} />
        </section>

        {/* Multi-step loader */}
        <AnimatePresence>
          {loading && <AnalysisLoader key="loader" />}
        </AnimatePresence>

        {error && (
          <div className="mb-8 p-4 glass-card border-danger-500/30 text-danger-400 animate-fade-in">
            <p className="font-semibold">⚠️ Error</p>
            <p className="text-sm mt-1 text-white/60">{error}</p>
          </div>
        )}

        {data && (
          <div className="space-y-10 animate-slide-up">
            {/* Route Cards */}
            <section id="route-cards">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <span className="w-1.5 h-8 bg-gradient-to-b from-brand-400 to-brand-600 rounded-full" />
                  Route Analysis
                </h2>
                {/* PDF Export lives next to the heading */}
                <ExportButton data={data} />
              </div>
              <RouteCards
                routes={data.routes}
                recommendation={data.recommendation}
                hoveredRoute={hoveredRoute}
                onHover={setHoveredRoute}
              />
            </section>

            {/* Chart */}
            <section id="cost-chart">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-1.5 h-8 bg-gradient-to-b from-cyan-400 to-brand-600 rounded-full" />
                Cost Illusion Analysis
              </h2>
              <CostChart routes={data.routes} />
            </section>

            {/* 3D Globe */}
            <section id="global-map" className="animate-slide-up" style={{ animationDelay: "150ms" }}>
              <GlobeMap routes={data.routes} hoveredRoute={hoveredRoute} />
            </section>

            {/* What-If Scenario Simulator */}
            <section id="scenario-simulator">
              <ScenarioSimulator data={data} />
            </section>

            {/* Comparison Table */}
            <section id="comparison-table">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-1.5 h-8 bg-gradient-to-b from-brand-400 to-cyan-400 rounded-full" />
                Detailed Comparison
              </h2>
              <RouteComparison routes={data.routes} />
            </section>

            {/* Explanation Panel */}
            <section id="recommendation-explanation">
              <ExplanationPanel recommendation={data.recommendation} routes={data.routes} ai_insights={data.ai_insights} />
            </section>

            {/* Business Impact */}
            <section id="business-impact">
              <BusinessImpactPanel impact={data.business_impact} />
            </section>
          </div>
        )}

        {/* Empty state */}
        {!data && !loading && !error && (
          <div className="text-center py-24 animate-fade-in">
            <div className="text-6xl mb-6">🌐</div>
            <h2 className="text-2xl font-bold mb-3 gradient-text">
              Ready to uncover the TRUE cost
            </h2>
            <p className="text-white/40 max-w-lg mx-auto">
              Enter your shipment details above to compare routes, detect hidden costs,
              and get an AI-powered recommendation for your procurement decision.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
