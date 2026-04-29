/**
 * GLOBAL PRESETS
 * The single source of truth for all routes in TradeRoute AI.
 *
 * RULE: Every route within a preset MUST have the SAME destination
 * that matches the InputForm preset data's destination field.
 *
 * preset_1 → Mumbai
 * preset_2 → Pune
 * preset_3 → Delhi
 * preset_4 → Mumbai
 * preset_5 → Mumbai
 * preset_6 → Pune
 */

export interface MapRoute {
  id: string;
  label: string;
  type: "sea" | "air";
  origin: string;
  destination: "Pune" | "Mumbai" | "Delhi" | "Chennai";
  nodes: string[]; // List of names from NODES database
  chokepoints: string[];
  baseColor: string;
  riskLevel: "low" | "medium" | "high";
  isRecommended?: boolean;
  isFastest?: boolean;
  isCheapest?: boolean;
}

export interface Preset {
  id: string;
  label: string;
  routes: MapRoute[];
}

export const GLOBAL_PRESETS: Record<string, Preset> = {
  // ═══════════════════════════════════════════════════════
  // PRESET 1 — Asia → India — ALL routes end at MUMBAI
  // ═══════════════════════════════════════════════════════
  preset_1: {
    id: "asia_india",
    label: "Asia → Mumbai",
    routes: [
      {
        id: "china_mumbai_sea",
        label: "Shanghai → Mumbai (Sea)",
        type: "sea",
        origin: "Shanghai Port",
        destination: "Mumbai",
        nodes: ["Shanghai Port", "Singapore Port", "Mumbai"],
        chokepoints: ["Malacca Strait"],
        baseColor: "blue",
        riskLevel: "medium",
        isCheapest: true
      },
      {
        id: "vietnam_mumbai_sea",
        label: "Haiphong → Mumbai (Sea)",
        type: "sea",
        origin: "Haiphong Port",
        destination: "Mumbai",
        nodes: ["Haiphong Port", "Singapore Port", "Chennai Port", "Mumbai"],
        chokepoints: ["Malacca Strait"],
        baseColor: "green",
        riskLevel: "low",
        isRecommended: true
      },
      {
        id: "shenzhen_mumbai_air",
        label: "Shenzhen → Mumbai (Air)",
        type: "air",
        origin: "Shenzhen",
        destination: "Mumbai",
        nodes: ["SZX (Shenzhen)", "Mumbai"],
        chokepoints: [],
        baseColor: "purple",
        riskLevel: "low",
        isFastest: true
      }
    ]
  },

  // ═══════════════════════════════════════════════════════
  // PRESET 2 — Middle East → India — ALL routes end at CHENNAI
  // ═══════════════════════════════════════════════════════
  preset_2: {
    id: "middle_east_india",
    label: "Middle East → Chennai",
    routes: [
      {
        id: "jebel_ali_chennai_sea",
        label: "Jebel Ali → Chennai (Sea)",
        type: "sea",
        origin: "Jebel Ali Port",
        destination: "Chennai",
        nodes: ["Jebel Ali Port", "Chennai"],
        chokepoints: ["Strait of Hormuz"],
        baseColor: "blue",
        riskLevel: "low",
        isCheapest: true,
        isRecommended: true
      },
      {
        id: "doha_chennai_air",
        label: "Doha → Chennai (Air)",
        type: "air",
        origin: "Doha",
        destination: "Chennai",
        nodes: ["DOH (Doha)", "Chennai"],
        chokepoints: [],
        baseColor: "purple",
        riskLevel: "low",
        isFastest: true
      },
      {
        id: "dubai_chennai_sea",
        label: "Dubai → Chennai (Sea)",
        type: "sea",
        origin: "Dubai",
        destination: "Chennai",
        nodes: ["Jebel Ali Port", "Chennai"],
        chokepoints: ["Strait of Hormuz"],
        baseColor: "blue",
        riskLevel: "low"
      }
    ]
  },

  // ═══════════════════════════════════════════════════════
  // PRESET 3 — Europe → India — ALL routes end at DELHI
  // ═══════════════════════════════════════════════════════
  preset_3: {
    id: "europe_india",
    label: "Europe → Delhi",
    routes: [
      {
        id: "hamburg_delhi_sea",
        label: "Hamburg → Delhi (Sea + Rail)",
        type: "sea",
        origin: "Hamburg Port",
        destination: "Delhi",
        nodes: ["Hamburg Port", "Jebel Ali Port", "Mumbai Port"],
        chokepoints: ["Suez Canal", "Bab-el-Mandeb", "Gibraltar"],
        baseColor: "blue",
        riskLevel: "high",
        isCheapest: true
      },
      {
        id: "frankfurt_delhi_air",
        label: "Frankfurt → Delhi (Air)",
        type: "air",
        origin: "Frankfurt",
        destination: "Delhi",
        nodes: ["FRA (Frankfurt)", "Delhi"],
        chokepoints: [],
        baseColor: "purple",
        riskLevel: "low",
        isFastest: true,
        isRecommended: true
      },
      {
        id: "rotterdam_delhi_sea",
        label: "Rotterdam → Delhi (Sea + Rail)",
        type: "sea",
        origin: "Rotterdam Port",
        destination: "Delhi",
        nodes: ["Rotterdam Port", "Jebel Ali Port", "Mumbai"],
        chokepoints: ["Suez Canal"],
        baseColor: "blue",
        riskLevel: "high"
      }
    ]
  },

  // ═══════════════════════════════════════════════════════
  // PRESET 4 — USA → India — ALL routes end at MUMBAI
  // ═══════════════════════════════════════════════════════
  preset_4: {
    id: "usa_india",
    label: "USA → Mumbai",
    routes: [
      {
        id: "la_mumbai_pacific",
        label: "Los Angeles → Mumbai (Sea)",
        type: "sea",
        origin: "Los Angeles Port",
        destination: "Mumbai",
        nodes: ["Los Angeles Port", "Singapore Port", "Mumbai"],
        chokepoints: ["Malacca Strait"],
        baseColor: "blue",
        riskLevel: "medium",
        isCheapest: true
      },
      {
        id: "ny_mumbai_air",
        label: "New York → Mumbai (Air)",
        type: "air",
        origin: "New York",
        destination: "Mumbai",
        nodes: ["JFK (New York)", "Mumbai"],
        chokepoints: [],
        baseColor: "purple",
        riskLevel: "low",
        isFastest: true,
        isRecommended: true
      },
      {
        id: "seattle_mumbai_sea",
        label: "Seattle → Mumbai (Sea)",
        type: "sea",
        origin: "Seattle Port",
        destination: "Mumbai",
        nodes: ["Seattle Port", "Singapore Port", "Mumbai"],
        chokepoints: ["Malacca Strait"],
        baseColor: "blue",
        riskLevel: "medium"
      }
    ]
  },

  // ═══════════════════════════════════════════════════════
  // PRESET 5 — East Asia → India — ALL routes end at MUMBAI
  // ═══════════════════════════════════════════════════════
  preset_5: {
    id: "east_asia_india",
    label: "East Asia → Mumbai",
    routes: [
      {
        id: "tokyo_mumbai_sea",
        label: "Tokyo → Mumbai (Sea)",
        type: "sea",
        origin: "Tokyo Port",
        destination: "Mumbai",
        nodes: ["Tokyo Port", "Singapore Port", "Mumbai"],
        chokepoints: ["Malacca Strait"],
        baseColor: "blue",
        riskLevel: "medium",
        isCheapest: true
      },
      {
        id: "seoul_mumbai_air",
        label: "Seoul → Mumbai (Air)",
        type: "air",
        origin: "Seoul",
        destination: "Mumbai",
        nodes: ["ICN (Seoul)", "Mumbai"],
        chokepoints: [],
        baseColor: "purple",
        riskLevel: "low",
        isFastest: true,
        isRecommended: true
      },
      {
        id: "osaka_mumbai_sea",
        label: "Osaka → Mumbai (Sea via Chennai)",
        type: "sea",
        origin: "Osaka Port",
        destination: "Mumbai",
        nodes: ["Osaka Port", "Singapore Port", "Chennai Port", "Mumbai"],
        chokepoints: ["Malacca Strait"],
        baseColor: "blue",
        riskLevel: "low"
      }
    ]
  },

  // ═══════════════════════════════════════════════════════
  // PRESET 6 — India Domestic — ALL routes end at CHENNAI
  // ═══════════════════════════════════════════════════════
  preset_6: {
    id: "india_domestic",
    label: "India Domestic → Chennai",
    routes: [
      {
        id: "mundra_chennai_rail",
        label: "Mundra → Chennai (Rail)",
        type: "sea",
        origin: "Mundra Port",
        destination: "Chennai",
        nodes: ["Mundra Port", "Chennai"],
        chokepoints: [],
        baseColor: "blue",
        riskLevel: "low",
        isCheapest: true,
        isRecommended: true
      },
      {
        id: "delhi_chennai_air",
        label: "Delhi → Chennai (Air)",
        type: "air",
        origin: "Delhi",
        destination: "Chennai",
        nodes: ["DEL (Delhi)", "Chennai"],
        chokepoints: [],
        baseColor: "purple",
        riskLevel: "low",
        isFastest: true
      },
      {
        id: "kolkata_chennai_rail",
        label: "Kolkata → Chennai (Rail)",
        type: "sea",
        origin: "Kolkata Port",
        destination: "Chennai",
        nodes: ["Kolkata Port", "Chennai"],
        chokepoints: [],
        baseColor: "blue",
        riskLevel: "medium"
      }
    ]
  }
};
