import { ScoreBand, Violation } from '../types/score';
import { bandFromScore } from './bandFromScore';

type OffenceRule = {
  code: string;
  name: string;
  points: number;
  keywords: string[];
};

const offenceRules: OffenceRule[] = [
  { code: 'THZ1', name: 'Drunk Driving', points: 100, keywords: ['drunk', 'alcohol', 'intoxicated', 'influence of alcohol', 'drugs'] },
  { code: 'THZ2', name: 'Dangerous Driving', points: 90, keywords: ['jumping red light', 'signal jump', 'red light', 'violating stop sign', 'stop sign', 'handheld', 'mobile phone', 'texting', 'overtaking', 'passing vehicle', 'against traffic', 'wrong flow', 'dangerous driving', 'reckless', 'mentally unfit', 'physically unfit'] },
  { code: 'THZ3', name: 'Disobeying Police', points: 90, keywords: ['disobey police', 'misbehavior', 'police officer', 'withholding information', 'refused police'] },
  { code: 'THZ4', name: 'Over Speeding', points: 80, keywords: ['overspeed', 'over speeding', 'speed limit', 'racing', 'above permitted speed', 'without speed governor'] },
  { code: 'THZ5', name: 'Driving Without License/Insurance/PUCC', points: 70, keywords: ['without license', 'no license', 'without insurance', 'expired insurance', 'disqualified', 'juvenile', 'unauthorized person', 'without pucc', 'no pucc'] },
  { code: 'THZ6', name: 'Wrong Lane / No Entry', points: 60, keywords: ['wrong lane', 'proper lane', 'foot path', 'footpath', 'no entry', 'nmv lane'] },
  { code: 'THZ7', name: 'Hazardous Goods Carriage', points: 50, keywords: ['hazardous goods', 'dangerous goods', 'carriage by road act', 'transport dangerous goods'] },
  { code: 'THZ8', name: 'Traffic Signs Violation', points: 50, keywords: ['yellow line', 'mandatory sign', 'traffic sign'] },
  { code: 'THZ9', name: 'Overloading', points: 40, keywords: ['overloading', 'extra passenger', 'weight limit', 'high load', 'long load', 'extra passenger on driver seat', 'two wheeler overloading'] },
  { code: 'THZ10', name: 'Safety Measures', points: 30, keywords: ['without helmet', 'helmet', 'seat belt', 'seatbelt', 'child restraint', 'unsafe vehicle', 'unfit vehicle', 'no seatbelt'] },
  { code: 'THZ11', name: 'Vehicle Modification', points: 20, keywords: ['vehicle modification', 'retro fitting', 'modified silencer', 'pressure horn', 'rupd', 'lupd'] },
  { code: 'THZ12', name: 'Wrong Parking', points: 10, keywords: ['wrong parking', 'improper parking', 'obstructive parking', 'picking passenger without stand'] }
];

const normalize = (text: string) => text.toLowerCase().trim();

export function classifyOffence(type: string): OffenceRule {
  const haystack = normalize(type);
  const match = offenceRules.find((rule) => rule.keywords.some((k) => haystack.includes(k)));
  return match ?? { code: 'THZ12', name: 'Wrong Parking', points: 10, keywords: [] };
}

export function repeatMultiplier(instance: number): number {
  if (instance <= 2) return 1;
  if (instance <= 4) return 2;
  return 3;
}

export type ScoredViolation = Violation & {
  code: string;
  basePoints: number;
  instance: number;
  multiplier: number;
  impactPoints: number;
};

export function scoreViolations(violations: Violation[], windowMonths = 12, now = new Date()): ScoredViolation[] {
  const windowStart = new Date(now);
  windowStart.setMonth(windowStart.getMonth() - windowMonths);
  const inWindow = violations.filter((v) => {
    const d = new Date(v.date);
    return !Number.isNaN(d.getTime()) && d >= windowStart && d <= now;
  });

  const grouped: Record<string, Violation[]> = {};
  inWindow.forEach((v) => {
    const rule = classifyOffence(v.type);
    const groupingCode = v.categoryCode || rule.code;
    grouped[groupingCode] = grouped[groupingCode] || [];
    grouped[groupingCode].push(v);
  });

  const scored: ScoredViolation[] = [];
  Object.entries(grouped).forEach(([code, items]) => {
    const sorted = items.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    sorted.forEach((v, idx) => {
      const rule = classifyOffence(v.type);
      const instance = idx + 1;
      const multiplier = repeatMultiplier(instance);
      const basePoints = v.categoryDeduction ?? rule.points;
      const impactPoints = basePoints * multiplier;
      scored.push({ ...v, code: v.categoryCode || code, basePoints, instance, multiplier, impactPoints });
    });
  });

  return scored.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function calculateScoreFromViolations(violations: Violation[], startScore = 300): { score: number; band: ScoreBand; totalDeduction: number } {
  const scored = scoreViolations(violations);
  const totalDeduction = scored.reduce((acc, v) => acc + v.impactPoints, 0);
  const score = Math.max(0, startScore - totalDeduction);
  return { score, band: bandFromScore(score), totalDeduction };
}

export function premiumAdjustmentPercent(band: ScoreBand): number {
  switch (band) {
    case 'EXEMPLARY':
      return -20;
    case 'RESPONSIBLE':
      return -10;
    case 'AVERAGE':
      return 25;
    case 'MARGINAL':
      return 50;
    case 'AT_RISK':
      return 75;
    case 'HIGH_RISK':
      return 100;
    case 'SERIOUS_RISK':
      return 125;
    case 'CHRONIC_VIOLATOR':
      return 150;
    case 'HABITUAL_OFFENDER':
      return 175;
    case 'EXTREME_RISK':
      return 200;
    default:
      return 0;
  }
}
