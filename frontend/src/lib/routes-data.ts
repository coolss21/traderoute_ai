/**
 * GOLD STANDARD ROUTES
 * Fixed coordinate paths for a stable, demo-ready visualization.
 * Coordinates are [longitude, latitude] for react-simple-maps.
 */

export interface RouteSegment {
  name: string;
  points: [number, number][];
}

export interface GoldRoute {
  route_id: string;
  name: string;
  type: "sea" | "air";
  segments: RouteSegment[];
  base_color: string;
}

export const GOLD_ROUTES: GoldRoute[] = [
  {
    route_id: "china_mumbai_sea",
    name: "Sea via Mumbai",
    type: "sea",
    base_color: "#3390ff",
    segments: [
      {
        name: "South China Sea",
        points: [[114.05, 22.54], [110.0, 15.0], [105.0, 5.0]]
      },
      {
        name: "Malacca Strait",
        points: [[105.0, 5.0], [103.5, 1.5], [98.0, 5.0]]
      },
      {
        name: "Strait of Hormuz",
        points: [[98.0, 5.0], [75.0, 15.0], [56.5, 26.5], [70.0, 20.0]]
      },
      {
        name: "JNPT Mumbai",
        points: [[70.0, 20.0], [72.95, 18.95], [73.85, 18.52]]
      }
    ]
  },
  {
    route_id: "china_chennai_sea",
    name: "Sea via Chennai",
    type: "sea",
    base_color: "#4ade80",
    segments: [
      {
        name: "South China Sea",
        points: [[114.05, 22.54], [110.0, 15.0], [105.0, 5.0]]
      },
      {
        name: "Malacca Strait",
        points: [[105.0, 5.0], [103.5, 1.5], [95.0, 6.0]]
      },
      {
        name: "Bay of Bengal",
        points: [[95.0, 6.0], [88.0, 12.0], [80.27, 13.08]]
      },
      {
        name: "Final Delivery",
        points: [[80.27, 13.08], [73.85, 18.52]]
      }
    ]
  },
  {
    route_id: "china_delhi_air",
    name: "Air via Delhi",
    type: "air",
    base_color: "#a855f7",
    segments: [
      {
        name: "Air Transit",
        points: [[114.05, 22.54], [95.0, 25.0], [77.10, 28.55]]
      },
      {
        name: "Domestic Delivery",
        points: [[77.10, 28.55], [73.85, 18.52]]
      }
    ]
  },
  {
    route_id: "europe_delhi_sea",
    name: "Europe via Suez",
    type: "sea",
    base_color: "#3390ff",
    segments: [
      {
        name: "North Sea & Atlantic",
        points: [[9.99, 53.55], [-5.0, 45.0], [-9.0, 35.0], [5.0, 37.0]]
      },
      {
        name: "Suez Canal",
        points: [[5.0, 37.0], [20.0, 35.0], [32.5, 30.5], [35.0, 20.0]]
      },
      {
        name: "Strait of Hormuz",
        points: [[35.0, 20.0], [50.0, 15.0], [56.5, 26.5], [70.0, 20.0]]
      },
      {
        name: "Final Port",
        points: [[70.0, 20.0], [72.95, 18.95], [77.10, 28.70]]
      }
    ]
  },
  {
    route_id: "usa_mumbai_sea",
    name: "US via Pacific",
    type: "sea",
    base_color: "#3390ff",
    segments: [
      {
        name: "Pacific Crossing",
        points: [[-118.24, 34.05], [-160.0, 20.0], [160.0, 15.0], [125.0, 10.0]]
      },
      {
        name: "Malacca Strait",
        points: [[125.0, 10.0], [115.0, 5.0], [103.5, 1.5], [90.0, 5.0]]
      },
      {
        name: "Strait of Hormuz",
        points: [[90.0, 5.0], [70.0, 15.0], [56.5, 26.5], [72.95, 18.95]]
      }
    ]
  },
  {
    route_id: "dubai_pune_sea",
    name: "Dubai Fast-Track",
    type: "sea",
    base_color: "#3390ff",
    segments: [
      {
        name: "Strait of Hormuz",
        points: [[55.27, 25.20], [56.5, 26.5], [65.0, 22.0]]
      },
      {
        name: "Arabian Sea",
        points: [[65.0, 22.0], [72.95, 18.95], [73.85, 18.52]]
      }
    ]
  }
];
