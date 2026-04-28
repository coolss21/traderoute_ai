/**
 * Cost Illusion Engine — TypeScript port of the Python true_cost.py
 * Implements Cost Illusion Detection: the core differentiator of TradeRoute AI.
 */

export interface RouteWithCost {
  route_id: string;
  name: string;
  path: string[];
  landed_cost: number;
  hidden_cost: number;
  true_cost: number;
  is_cost_illusion?: boolean;
  cost_illusion_warning?: string | null;
  [key: string]: unknown;
}

export function computeTrueCost(landedCost: number, hiddenCost: number): number {
  return Math.round((landedCost + hiddenCost) * 100) / 100;
}

/**
 * Cost Illusion Detection — the core differentiator.
 * A route is a "cost illusion" when:
 *  1. It has the lowest base/landed cost among all routes, AND
 *  2. Its true cost is NOT the lowest (hidden costs push it above another route).
 * Also flags routes where hidden cost exceeds 8% of landed cost.
 */
export function detectCostIllusion(routes: RouteWithCost[]): RouteWithCost[] {
  if (!routes.length) return routes;

  const sortedByLanded = [...routes].sort((a, b) => a.landed_cost - b.landed_cost);
  const cheapestLandedValue = sortedByLanded[0].landed_cost;

  const sortedByTrue = [...routes].sort((a, b) => a.true_cost - b.true_cost);
  const cheapestTrue = sortedByTrue[0];

  return routes.map((route) => {
    const { landed_cost, true_cost, hidden_cost } = route;
    const hiddenPct = landed_cost > 0 ? (hidden_cost / landed_cost) * 100 : 0;

    let isIllusion = false;
    let warning: string | null = null;

    // Primary illusion: cheapest landed but NOT cheapest true
    if (landed_cost === cheapestLandedValue && true_cost > cheapestTrue.true_cost) {
      isIllusion = true;
      const extra = true_cost - cheapestTrue.true_cost;
      const viaNode = cheapestTrue.path[cheapestTrue.path.length - 2] ?? "optimal";
      warning =
        `⚠️ Cost Illusion Detected: This route appears $${landed_cost.toLocaleString("en", { maximumFractionDigits: 0 })} ` +
        `(cheapest upfront), but hidden costs of $${hidden_cost.toLocaleString("en", { maximumFractionDigits: 0 })} push the ` +
        `true cost to $${true_cost.toLocaleString("en", { maximumFractionDigits: 0 })} — $${extra.toLocaleString("en", { maximumFractionDigits: 0 })} MORE than the actual ` +
        `best option via ${viaNode}.`;
    }
    // Secondary illusion: high hidden cost ratio
    else if (hiddenPct > 8.0) {
      isIllusion = true;
      warning =
        `⚠️ High Hidden Cost: ${hiddenPct.toFixed(1)}% of the landed cost ` +
        `($${hidden_cost.toLocaleString("en", { maximumFractionDigits: 0 })}) is hidden risk cost — port congestion and ` +
        `delay penalties significantly inflate the true cost.`;
    }

    return { ...route, is_cost_illusion: isIllusion, cost_illusion_warning: warning };
  });
}
