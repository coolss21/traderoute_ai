"use client";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-surface-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-400 flex items-center justify-center text-lg font-bold shadow-lg shadow-brand-500/30">
            T
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              TradeRoute <span className="gradient-text">AI</span>
            </h1>
            <p className="text-[10px] text-white/30 -mt-0.5 tracking-wider uppercase">
              Landed Cost Intelligence
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="badge-brand text-[10px]">v1.0 — Live Demo</span>
          <div className="w-2 h-2 rounded-full bg-success-400 animate-pulse-slow" />
        </div>
      </div>
    </header>
  );
}
