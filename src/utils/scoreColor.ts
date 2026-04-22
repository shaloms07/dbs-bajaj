import { ScoreBand } from '../types/score';

export function scoreColor(band: ScoreBand): string {
  switch (band) {
    case 'EXEMPLARY':
      return '#059669';
    case 'RESPONSIBLE':
      return '#16a34a';
    case 'AVERAGE':
      return '#22c55e';
    case 'MARGINAL':
      return '#eab308';
    case 'AT_RISK':
      return '#f97316';
    case 'HIGH_RISK':
      return '#ef4444';
    case 'SERIOUS_RISK':
      return '#dc2626';
    case 'CHRONIC_VIOLATOR':
      return '#b91c1c';
    case 'HABITUAL_OFFENDER':
      return '#991b1b';
    case 'EXTREME_RISK':
      return '#7f1d1d';
    default:
      return '#64748b';
  }
}
