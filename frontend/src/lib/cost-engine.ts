/**
 * Cost Engine — TypeScript port of the Python landed_cost.py
 * Calculates full landed cost: customs, taxes, freight, insurance, handling.
 */
import { getTariffInfo } from "@/lib/data/hsn-tariffs";

export interface RouteParams {
  freight_rate_per_kg: number;
  min_freight: number;
  insurance_rate: number;
  terminal_handling: number;
  domestic_transport: number;
  warehousing_per_day: number;
  warehousing_days: number;
}

export interface CostBreakdown {
  supplier_invoice: number;
  customs_duty_bcd: number;
  igst: number;
  surcharge_cess: number;
  freight_cost: number;
  insurance: number;
  terminal_handling: number;
  domestic_transport: number;
  warehousing: number;
  total_landed_cost: number;
}

function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateLandedCost(
  invoiceValue: number,
  quantity: number,
  hsnCode: string,
  routeParams: RouteParams,
  weightPerUnitKg = 0.5
): CostBreakdown {
  const tariff = getTariffInfo(hsnCode);
  const totalWeight = quantity * weightPerUnitKg;

  // Freight
  const freightCost = Math.max(
    routeParams.freight_rate_per_kg * totalWeight,
    routeParams.min_freight
  );

  // Insurance
  const insurance = (invoiceValue + freightCost) * routeParams.insurance_rate;

  // Assessable value (CIF basis)
  const assessableValue = invoiceValue + freightCost + insurance;

  // BCD
  const bcdRate = tariff.bcd_rate / 100;
  const customsDutyBcd = assessableValue * bcdRate;

  // Social Welfare Surcharge on BCD
  const swsRate = tariff.social_welfare_surcharge_rate / 100;
  let surchargeCess = customsDutyBcd * swsRate;

  // Anti-dumping + Safeguard
  const antiDumping = assessableValue * (tariff.anti_dumping_duty / 100);
  const safeguard = assessableValue * (tariff.safeguard_duty / 100);
  surchargeCess += antiDumping + safeguard;

  // IGST
  const igstBase = assessableValue + customsDutyBcd + surchargeCess;
  const igstRate = tariff.igst_rate / 100;
  const igst = igstBase * igstRate;

  // Terminal handling, domestic transport, warehousing
  const terminalHandling = routeParams.terminal_handling;
  const domesticTransport = routeParams.domestic_transport;
  const warehousing = routeParams.warehousing_per_day * routeParams.warehousing_days;

  const totalLandedCost =
    invoiceValue +
    customsDutyBcd +
    igst +
    surchargeCess +
    freightCost +
    insurance +
    terminalHandling +
    domesticTransport +
    warehousing;

  return {
    supplier_invoice: r2(invoiceValue),
    customs_duty_bcd: r2(customsDutyBcd),
    igst: r2(igst),
    surcharge_cess: r2(surchargeCess),
    freight_cost: r2(freightCost),
    insurance: r2(insurance),
    terminal_handling: r2(terminalHandling),
    domestic_transport: r2(domesticTransport),
    warehousing: r2(warehousing),
    total_landed_cost: r2(totalLandedCost),
  };
}
