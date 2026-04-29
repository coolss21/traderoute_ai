/**
 * NODES DATABASE
 * The definitive list of allowed logistics nodes and their coordinates.
 */

export const NODES: Record<string, [number, number]> = {
  // Ports
  "Shanghai Port": [31.2304, 121.4737],
  "Ningbo Port": [29.8683, 121.5440],
  "Shenzhen Port": [22.5431, 114.0579],
  "Singapore Port": [1.2903, 103.8519],
  "Jebel Ali Port": [25.0657, 55.1713],
  "Mundra Port": [22.8441, 69.7343],
  "Mumbai Port (JNPT)": [18.9500, 72.9500],
  "Mumbai Port": [19.0760, 72.8777],
  "Chennai Port": [13.0827, 80.2707],
  "Kolkata Port": [22.5726, 88.3639],
  "Hamburg Port": [53.5511, 9.9937],
  "Rotterdam Port": [51.9225, 4.4792],
  "Los Angeles Port": [33.7405, -118.2721],
  "Seattle Port": [47.6062, -122.3321],
  "Tokyo Port": [35.6762, 139.6503],
  "Osaka Port": [34.6937, 135.5023],
  "Haiphong Port": [20.8449, 106.6881],

  // Airports
  "PVG (Shanghai)": [31.1443, 121.8083],
  "SZX (Shenzhen)": [22.6262, 113.8114],
  "SIN (Singapore)": [1.3644, 103.9915],
  "DXB (Dubai)": [25.2532, 55.3657],
  "DOH (Doha)": [25.2731, 51.6081],
  "FRA (Frankfurt)": [50.0379, 8.5622],
  "JFK (New York)": [40.6413, -73.7781],
  "ICN (Seoul)": [37.4602, 126.4407],
  "DEL (Delhi)": [28.5562, 77.1000],
  "BOM (Mumbai)": [19.0896, 72.8656],
  "MAA (Chennai)": [12.9941, 80.1709],

  // Cities (Final Destinations)
  "Pune": [18.5204, 73.8567],
  "Mumbai": [19.0760, 72.8777],
  "Delhi": [28.7041, 77.1025],
  "Chennai": [13.0827, 80.2707]
};
