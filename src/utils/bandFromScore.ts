import { ScoreBand } from '../types/score';

export function bandFromScore(score: number): ScoreBand {
  if (score >= 285) return 'EXEMPLARY';
  if (score >= 270) return 'RESPONSIBLE';
  if (score >= 240) return 'AVERAGE';
  if (score >= 210) return 'MARGINAL';
  if (score >= 180) return 'AT_RISK';
  if (score >= 150) return 'HIGH_RISK';
  if (score >= 120) return 'SERIOUS_RISK';
  if (score >= 90) return 'CHRONIC_VIOLATOR';
  if (score >= 60) return 'HABITUAL_OFFENDER';
  return 'EXTREME_RISK';
}
