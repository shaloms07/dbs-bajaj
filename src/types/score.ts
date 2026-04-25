export type ScoreBand =
  | 'EXEMPLARY'
  | 'RESPONSIBLE'
  | 'AVERAGE'
  | 'MARGINAL'
  | 'AT_RISK'
  | 'HIGH_RISK'
  | 'SERIOUS_RISK'
  | 'CHRONIC_VIOLATOR'
  | 'HABITUAL_OFFENDER'
  | 'EXTREME_RISK';

export interface Violation {
  type: string;
  date: string;
  location: string;
  thz: 'H' | 'M' | 'L';
  status: 'Open' | 'Paid' | 'Disputed';
  impact: number;
  challanDetails?: string;
  categoryCode?: string;
  categoryName?: string;
  categoryDescription?: string;
  categoryDeduction?: number;
}

export interface ScoreResult {
  regNo: string;
  vehicleType: string;
  ownerName?: string;
  score: number;
  band: ScoreBand;
  severityIndex: number;
  recentTrend: 'Up' | 'Stable' | 'Down';
  challanStatus: string;
  tpLoading: number;
  violations: Violation[];
  basePremium?: number;
  adjustedPremium?: number;
  premiumModifierPct?: number;
  windowStart?: string;
  windowEnd?: string;
  lastViolationDatetime?: string | null;
  violationCounts?: {
    total?: number;
    severe?: number;
    moderate?: number;
    low?: number;
  };
  fuelType?: string;
  stateName?: string;
  cc?: number;
  queriedAt?: string;
  freshAsOf?: string;
}
