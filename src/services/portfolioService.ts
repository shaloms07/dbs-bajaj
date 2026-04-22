import { sampleVehicleScores } from './mockData';
import { calculateScoreFromViolations } from '../utils/dbsScoring';

export type PortfolioFilters = {
  vehicleType?: string;
};

export interface PortfolioKPIs {
  activePolicies: number;
  avgScore: number;
  highRiskCount: number;
  tpLoadingRevenue: number;
}

export interface PortfolioChartData {
  band: string;
  count: number;
}

export async function fetchPortfolioKPIs(): Promise<PortfolioKPIs> {
  await new Promise((resolve) => setTimeout(resolve, 220));
  const values = Object.values(sampleVehicleScores).map((v) => ({
    ...v,
    ...calculateScoreFromViolations(v.violations)
  }));
  const activePolicies = values.length;
  const avgScore = Math.round(values.reduce((acc, v) => acc + v.score, 0) / Math.max(1, values.length));
  const highRiskCount = values.filter((v) =>
    ['AT_RISK', 'HIGH_RISK', 'SERIOUS_RISK', 'CHRONIC_VIOLATOR', 'HABITUAL_OFFENDER', 'EXTREME_RISK'].includes(v.band)
  ).length;
  const tpLoadingRevenue = values.reduce((acc, v) => acc + v.tpLoading, 0);
  return { activePolicies, avgScore, highRiskCount, tpLoadingRevenue };
}

export async function fetchPortfolioDistribution() {
  await new Promise((resolve) => setTimeout(resolve, 220));
  const map: Record<string, number> = {
    EXEMPLARY: 0,
    RESPONSIBLE: 0,
    AVERAGE: 0,
    MARGINAL: 0,
    AT_RISK: 0,
    HIGH_RISK: 0,
    SERIOUS_RISK: 0,
    CHRONIC_VIOLATOR: 0,
    HABITUAL_OFFENDER: 0,
    EXTREME_RISK: 0
  };
  Object.values(sampleVehicleScores).forEach((v) => {
    const computed = calculateScoreFromViolations(v.violations);
    map[computed.band] = (map[computed.band] || 0) + 1;
  });
  return Object.entries(map).map(([band, count]) => ({ band, count }));
}
