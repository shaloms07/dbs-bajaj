import { ScoreBand } from '../types/score';
import { scoreColor } from '../utils/scoreColor';

export default function BandBadge({ band }: { band: ScoreBand }) {
  const color = scoreColor(band);
  return (
    <span
      className="rounded-full px-3 py-1 text-xs font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      {band.replace(/_/g, ' ')}
    </span>
  );
}
