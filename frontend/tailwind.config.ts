import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef7ff",
          100: "#d9edff",
          200: "#bce0ff",
          300: "#8eceff",
          400: "#59b2ff",
          500: "#3390ff",
          600: "#1b70f5",
          700: "#145ae1",
          800: "#1749b6",
          900: "#19408f",
          950: "#142857",
        },
        surface: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
        success: { 400: "#4ade80", 500: "#22c55e", 600: "#16a34a" },
        danger: { 400: "#f87171", 500: "#ef4444", 600: "#dc2626" },
        warning: { 400: "#fbbf24", 500: "#f59e0b", 600: "#d97706" },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(51,144,255,0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(51,144,255,0.4)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
