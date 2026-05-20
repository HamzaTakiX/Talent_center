import { FunctionComponent } from 'react';

interface CvAiScoreRingProps {
  score: number;
  label: string;
  size?: number;
  tone?: 'excellent' | 'good' | 'fair' | 'low';
}

const CvAiScoreRing: FunctionComponent<CvAiScoreRingProps> = ({
  score,
  label,
  size = 72,
  tone = 'good',
}) => {
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;

  return (
    <div className={`cv-ai-ring cv-ai-ring--${tone}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle
          className="cv-ai-ring__track"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
        />
        <circle
          className="cv-ai-ring__progress"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="cv-ai-ring__center">
        <span className="cv-ai-ring__value">{score}</span>
        <span className="cv-ai-ring__label">{label}</span>
      </div>
    </div>
  );
};

export default CvAiScoreRing;
