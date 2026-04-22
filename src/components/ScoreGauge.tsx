import { ScoreBand } from '../types/score';
import { scoreColor } from '../utils/scoreColor';

interface ScoreGaugeProps {
  score: number;
  band: ScoreBand;
}

export default function ScoreGauge({ score, band }: ScoreGaugeProps) {
  const normalized = Math.max(0, Math.min(300, score));
  const angle = (normalized / 300) * 180;
  const color = scoreColor(band);

  const radius = 80;
  const centerX = 100;
  const centerY = 100;
  const startX = centerX - radius;
  const startY = centerY;
  const endX = centerX + radius * Math.cos(((180 - angle) * Math.PI) / 180);
  const endY = centerY - radius * Math.sin(((180 - angle) * Math.PI) / 180);
  const largeArcFlag = angle > 180 ? 1 : 0;

  const progressPath = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;

  return (
    <div className="mx-auto flex w-full max-w-[260px] flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="relative w-full">
        <svg className="w-full h-auto" viewBox="0 0 200 110" preserveAspectRatio="xMidYMid meet">
          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d={progressPath}
            fill="none"
            stroke={color}
            strokeWidth="16"
            strokeLinecap="round"
          />
          <circle cx={centerX} cy={centerY} r="5" fill="#ffffff" stroke="#94a3b8" strokeWidth="2" />
        </svg>
      </div>
      <div className="text-3xl font-bold text-slate-900">{normalized}</div>
      <div className="text-xs font-semibold uppercase tracking-widest text-emerald-600">{band.replace(/_/g, ' ')}</div>
    </div>
  );
}
