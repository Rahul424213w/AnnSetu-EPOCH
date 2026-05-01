// lib/delivery-engine.ts

// Calculates distance in km using Haversine formula
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);  
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI/180);
}

// Simulates real-time traffic based on time of day
export function getTrafficFactor(): { factor: number; level: 'Low' | 'Moderate' | 'Heavy' | 'Severe' } {
  const hour = new Date().getHours();
  // Peak hours: 8-10 AM, 5-8 PM
  if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)) {
    return { factor: 1.8, level: 'Heavy' };
  }
  // Late night: 11 PM - 5 AM
  if (hour >= 23 || hour <= 5) {
    return { factor: 0.8, level: 'Low' };
  }
  // Normal hours
  return { factor: 1.2, level: 'Moderate' };
}

// Spoilage risk based on food type and ETA
export function calculateSpoilageRisk(foodType: string, etaMinutes: number): { risk: 'Low' | 'Medium' | 'High' | 'Critical'; score: number } {
  const typeLower = foodType.toLowerCase();
  let baseVulnerability = 0;
  
  if (typeLower.includes('cooked') || typeLower.includes('dairy') || typeLower.includes('meat') || typeLower.includes('meals')) {
    baseVulnerability = 0.8;
  } else if (typeLower.includes('produce') || typeLower.includes('fruits') || typeLower.includes('vegetables') || typeLower.includes('fresh')) {
    baseVulnerability = 0.5;
  } else {
    baseVulnerability = 0.2; // Packaged/Dry
  }

  const riskScore = baseVulnerability * (etaMinutes / 60);

  if (riskScore > 0.8) return { risk: 'Critical', score: riskScore };
  if (riskScore > 0.5) return { risk: 'High', score: riskScore };
  if (riskScore > 0.3) return { risk: 'Medium', score: riskScore };
  return { risk: 'Low', score: riskScore };
}

export function calculateETA(lat1: number, lon1: number, lat2: number, lon2: number, loadSize: number = 1): {
  distanceKm: number;
  etaMinutes: number;
  trafficLevel: string;
} {
  const distance = getDistance(lat1, lon1, lat2, lon2);
  const traffic = getTrafficFactor();
  
  // Base speed: 30 km/h (0.5 km/min)
  const baseMinutes = distance / 0.5;
  
  // Load penalty (larger load = slightly slower)
  const loadPenalty = 1 + (loadSize * 0.05);

  const finalEta = Math.round(baseMinutes * traffic.factor * loadPenalty);

  return {
    distanceKm: Number(distance.toFixed(2)),
    etaMinutes: finalEta < 1 ? 1 : finalEta,
    trafficLevel: traffic.level,
  };
}

export function calculatePriorityRank(spoilageScore: number, distanceKm: number, expiryHours: number = 2): number {
  // Higher score = Higher Priority
  const distanceScore = Math.max(0, 10 - distanceKm); // Closer is better
  const urgencyScore = 10 / Math.max(0.1, expiryHours); // Less time = higher urgency
  
  return Number((spoilageScore * 40 + distanceScore * 2 + urgencyScore * 40).toFixed(1));
}
