import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TradeRoute AI — Landed Cost & Risk Intelligence",
  description:
    "Buyer-centric landed cost, route comparison, and risk intelligence platform. See the TRUE cost before making procurement decisions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
