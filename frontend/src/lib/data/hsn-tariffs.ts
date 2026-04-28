export interface TariffInfo {
  description: string;
  chapter: string;
  bcd_rate: number;
  igst_rate: number;
  social_welfare_surcharge_rate: number;
  anti_dumping_duty: number;
  safeguard_duty: number;
  notes: string;
}

export const HSN_TARIFFS: Record<string, TariffInfo> = {
  "3923": {
    description: "Articles for conveyance/packing of goods – Plastics",
    chapter: "39",
    bcd_rate: 15.0,
    igst_rate: 18.0,
    social_welfare_surcharge_rate: 10.0,
    anti_dumping_duty: 0.0,
    safeguard_duty: 0.0,
    notes: "Plastic containers, boxes, cases, crates – BCD applicable on assessable value",
  },
  "8471": {
    description: "Automatic data processing machines (Computers)",
    chapter: "84",
    bcd_rate: 0.0,
    igst_rate: 18.0,
    social_welfare_surcharge_rate: 10.0,
    anti_dumping_duty: 0.0,
    safeguard_duty: 0.0,
    notes: "ITA-bound, zero BCD",
  },
  "6110": {
    description: "Jerseys, pullovers, cardigans – Knitted",
    chapter: "61",
    bcd_rate: 20.0,
    igst_rate: 12.0,
    social_welfare_surcharge_rate: 10.0,
    anti_dumping_duty: 0.0,
    safeguard_duty: 0.0,
    notes: "Textile garments, high BCD protection",
  },
  "8517": {
    description: "Telephone sets, smartphones, communication apparatus",
    chapter: "85",
    bcd_rate: 20.0,
    igst_rate: 18.0,
    social_welfare_surcharge_rate: 10.0,
    anti_dumping_duty: 0.0,
    safeguard_duty: 0.0,
    notes: "Mobile phones – BCD raised to promote domestic manufacturing",
  },
  "7304": {
    description: "Tubes, pipes, hollow profiles – seamless, iron/steel",
    chapter: "73",
    bcd_rate: 10.0,
    igst_rate: 18.0,
    social_welfare_surcharge_rate: 10.0,
    anti_dumping_duty: 5.0,
    safeguard_duty: 0.0,
    notes: "Anti-dumping duty applicable on certain origin countries",
  },
  "2933": {
    description: "Heterocyclic compounds – Pharma intermediates",
    chapter: "29",
    bcd_rate: 7.5,
    igst_rate: 12.0,
    social_welfare_surcharge_rate: 10.0,
    anti_dumping_duty: 0.0,
    safeguard_duty: 0.0,
    notes: "Pharmaceutical API raw material",
  },
  "8703": {
    description: "Motor cars and vehicles for transport of persons",
    chapter: "87",
    bcd_rate: 60.0,
    igst_rate: 28.0,
    social_welfare_surcharge_rate: 10.0,
    anti_dumping_duty: 0.0,
    safeguard_duty: 0.0,
    notes: "CBU imports – highest duty bracket",
  },
};

export function getTariffInfo(hsnCode: string): TariffInfo {
  if (HSN_TARIFFS[hsnCode]) return HSN_TARIFFS[hsnCode];
  // Prefix match
  for (const [code, info] of Object.entries(HSN_TARIFFS)) {
    if (hsnCode.startsWith(code) || code.startsWith(hsnCode)) return info;
  }
  // Default fallback
  return {
    description: `Product HSN ${hsnCode}`,
    chapter: hsnCode.slice(0, 2),
    bcd_rate: 10.0,
    igst_rate: 18.0,
    social_welfare_surcharge_rate: 10.0,
    anti_dumping_duty: 0.0,
    safeguard_duty: 0.0,
    notes: "Default tariff applied",
  };
}
