"use client";

import { useState, useRef } from "react";
import type { AnalyzeResponse } from "@/types";

interface Props {
  data: AnalyzeResponse;
}

export default function ExportButton({ data }: Props) {
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    setDone(false);

    try {
      // Dynamic imports — keeps bundle size small
      const jsPDF = (await import("jspdf")).default;

      const recommended = data.routes.find((r) => r.is_recommended);
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
      });

      const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const W = 210;
      const MARGIN = 18;
      const COL = W - MARGIN * 2;
      let y = 0;

      // ── Helpers ──────────────────────────────────────────────────────────
      const hex = (h: string) => {
        const r = parseInt(h.slice(1, 3), 16);
        const g = parseInt(h.slice(3, 5), 16);
        const b = parseInt(h.slice(5, 7), 16);
        return [r, g, b] as [number, number, number];
      };
      const brand = hex("#3390ff");
      const success = hex("#4ade80");
      const danger = hex("#f87171");
      const dark = hex("#0f172a");
      const mid = hex("#1e293b");
      const text = hex("#e2e8f0");
      const muted = hex("#94a3b8");

      const setFont = (size: number, style: "normal" | "bold" = "normal", color = text) => {
        doc.setFontSize(size);
        doc.setFont("helvetica", style);
        doc.setTextColor(...color);
      };

      const box = (x: number, yy: number, w: number, h: number, color: [number, number, number], radius = 3) => {
        doc.setFillColor(...color);
        doc.roundedRect(x, yy, w, h, radius, radius, "F");
      };

      const labelValue = (label: string, value: string, x: number, yy: number) => {
        setFont(7, "normal", muted);
        doc.text(label.toUpperCase(), x, yy);
        setFont(10, "bold", text);
        doc.text(value, x, yy + 5);
      };

      // ── Cover Header ─────────────────────────────────────────────────────
      // Navy background band
      box(0, 0, W, 52, dark, 0);
      // Brand accent bar
      doc.setFillColor(...brand);
      doc.rect(0, 0, 4, 52, "F");

      // Logo area
      doc.setFillColor(...brand);
      doc.roundedRect(MARGIN, 12, 20, 20, 4, 4, "F");
      setFont(14, "bold", [255, 255, 255]);
      doc.text("T", MARGIN + 7, 25.5);

      // Title
      setFont(18, "bold", [255, 255, 255]);
      doc.text("TradeRoute AI", MARGIN + 26, 21);
      setFont(8, "normal", brand as [number, number, number]);
      doc.text("LANDED COST INTELLIGENCE REPORT", MARGIN + 26, 28);

      setFont(7, "normal", muted);
      doc.text(`Generated: ${dateStr}`, W - MARGIN - 2, 23, { align: "right" });
      doc.text(`Ref: TR-${now.getTime().toString().slice(-6)}`, W - MARGIN - 2, 29, { align: "right" });

      y = 62;

      // ── Shipment Summary ─────────────────────────────────────────────────
      setFont(12, "bold", brand as [number, number, number]);
      doc.text("Shipment Summary", MARGIN, y);
      y += 6;

      box(MARGIN, y, COL, 28, mid);
      const summaryItems = [
        ["Origin",      data.origin],
        ["Destination", data.destination],
        ["HSN Code",    data.hsn_code],
        ["Quantity",    data.quantity.toLocaleString() + " units"],
        ["Invoice Value", `$${data.invoice_value.toLocaleString()}`],
      ];
      const colW = COL / 5;
      summaryItems.forEach(([label, value], i) => {
        labelValue(label, value, MARGIN + 4 + i * colW, y + 8);
      });
      y += 36;

      // ── Route Comparison ──────────────────────────────────────────────────
      setFont(12, "bold", brand as [number, number, number]);
      doc.text("Route Analysis", MARGIN, y);
      y += 6;

      data.routes.forEach((route, i) => {
        const isRec = route.is_recommended;
        const isIllusion = route.is_cost_illusion;
        const accent = isRec ? success : isIllusion ? danger : muted;
        const bgColor: [number, number, number] = isRec ? [20, 46, 32] : isIllusion ? [46, 20, 20] : mid;

        box(MARGIN, y, COL, 38, bgColor);
        // Accent left bar
        doc.setFillColor(...accent);
        doc.roundedRect(MARGIN, y, 3, 38, 1, 1, "F");

        // Route type
        setFont(10, "bold", [255, 255, 255]);
        const typeLabel = route.route_type.charAt(0).toUpperCase() + route.route_type.slice(1);
        doc.text(`${typeLabel} Route`, MARGIN + 8, y + 9);

        // Badges
        if (isRec) {
          doc.setFillColor(...success);
          doc.roundedRect(MARGIN + 8, y + 12, 28, 5, 1.5, 1.5, "F");
          setFont(6, "bold", dark);
          doc.text("✓ RECOMMENDED", MARGIN + 10, y + 15.8);
        }
        if (isIllusion) {
          doc.setFillColor(...danger);
          doc.roundedRect(MARGIN + 8, y + 12, 26, 5, 1.5, 1.5, "F");
          setFont(6, "bold", dark);
          doc.text("⚠ COST ILLUSION", MARGIN + 9.5, y + 15.8);
        }

        // Path
        setFont(7, "normal", muted);
        doc.text(route.path.join(" → "), MARGIN + 8, y + 22);

        // Metrics grid
        const metrics = [
          ["Base Cost",   `$${route.cost_breakdown.total_landed_cost.toLocaleString()}`],
          ["Hidden Cost", `+$${route.risk_assessment.hidden_cost.toLocaleString()}`],
          ["TRUE COST",   `$${route.true_cost.toLocaleString()}`],
          ["Transit",     `${route.transit_days} days`],
          ["Risk",        route.risk_assessment.risk_level.toUpperCase()],
          ["Reliability", `${route.risk_assessment.transit_reliability_score}%`],
        ];
        const mColW = COL / 6;
        metrics.forEach(([label, value], mi) => {
          const color: [number, number, number] = mi === 2 ? (isRec ? success : text) : text;
          labelValue(label, value, MARGIN + 6 + mi * mColW, y + 28);
          if (mi === 2) { setFont(9, "bold", color); doc.text(value, MARGIN + 6 + mi * mColW, y + 33); }
        });

        y += 44;
      });

      // ── AI Recommendation ────────────────────────────────────────────────
      y += 4;
      setFont(12, "bold", brand as [number, number, number]);
      doc.text("AI Recommendation", MARGIN, y);
      y += 6;

      box(MARGIN, y, COL, 36, [15, 28, 50]);
      doc.setFillColor(...brand);
      doc.roundedRect(MARGIN, y, 3, 36, 1, 1, "F");

      setFont(9, "bold", brand as [number, number, number]);
      doc.text(`Recommended: ${data.recommendation.recommended_route_type.toUpperCase()} ROUTE`, MARGIN + 8, y + 9);
      setFont(7, "normal", muted);
      const explanationLines = doc.splitTextToSize(data.recommendation.explanation, COL - 16);
      doc.text(explanationLines.slice(0, 3), MARGIN + 8, y + 16);

      const confScore = `Confidence: ${Math.round(data.recommendation.confidence_score * 100)}%`;
      setFont(8, "bold", success);
      doc.text(confScore, MARGIN + 8, y + 31);
      y += 44;

      // ── Business Impact ───────────────────────────────────────────────────
      if (y > 240) { doc.addPage(); y = 20; }
      setFont(12, "bold", brand as [number, number, number]);
      doc.text("Business Impact", MARGIN, y);
      y += 6;

      const impactCols = [
        { label: "Potential Savings", value: `$${data.business_impact.potential_savings.toLocaleString()}`, color: success },
        { label: "Risk Reduction",    value: `+${data.business_impact.risk_reduction_pct}%`,               color: brand },
        { label: "Decision Confidence", value: data.business_impact.decision_confidence,                   color: [103, 232, 249] as [number, number, number] },
      ];
      const impW = (COL - 8) / 3;
      impactCols.forEach(({ label, value, color }, i) => {
        box(MARGIN + i * (impW + 4), y, impW, 22, mid);
        setFont(7, "normal", muted);
        doc.text(label.toUpperCase(), MARGIN + i * (impW + 4) + 4, y + 7);
        setFont(13, "bold", color);
        doc.text(value, MARGIN + i * (impW + 4) + 4, y + 17);
      });
      y += 30;

      // ── Audit Trail ───────────────────────────────────────────────────────
      setFont(9, "bold", muted);
      doc.text("Audit Trail", MARGIN, y);
      y += 5;
      data.business_impact.audit_trail.forEach((item, i) => {
        setFont(7, "normal", muted);
        doc.text(`${i + 1}.  ${item}`, MARGIN + 2, y);
        y += 5;
      });

      // ── Footer ────────────────────────────────────────────────────────────
      const pageCount = doc.getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        doc.setPage(p);
        box(0, 284, W, 13, dark, 0);
        doc.setFillColor(...brand);
        doc.rect(0, 284, 4, 13, "F");
        setFont(7, "normal", muted);
        doc.text("TradeRoute AI — Confidential Executive Report", MARGIN, 292);
        doc.text(`Page ${p} / ${pageCount}`, W - MARGIN, 292, { align: "right" });
      }

      const filename = `traderoute-report-${data.origin}-${data.destination}-${now.getTime()}.pdf`.replace(/\s+/g, "_").toLowerCase();
      doc.save(filename);
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      id="export-pdf-button"
      onClick={handleExport}
      disabled={exporting}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 border ${
        done
          ? "bg-success-500/20 border-success-500/40 text-success-300 shadow-[0_0_12px_rgba(74,222,128,0.2)]"
          : "bg-white/[0.06] border-white/[0.1] text-white/70 hover:bg-white/[0.1] hover:border-white/[0.2] hover:text-white"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {exporting ? (
        <>
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Generating PDF…
        </>
      ) : done ? (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Report Saved!
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export PDF Report
        </>
      )}
    </button>
  );
}
