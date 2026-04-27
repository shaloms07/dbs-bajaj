import { ScoreBand } from '../types/score';

function normalizeBandKey(band: ScoreBand | string): string {
  return band
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function scoreColor(band: ScoreBand | string): string {
  switch (normalizeBandKey(band)) {
    case 'EXEMPLARY':
      return '#0f766e';
    case 'EXCELLENT':
      return '#059669';
    case 'LOW':
      return '#22c55e';
    case 'MODERATE':
      return '#eab308';
    case 'HIGH':
      return '#f97316';
    case 'SEVERE':
      return '#dc2626';
    default:
      return '#64748b';
  }
}
