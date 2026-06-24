import { FunctionComponent, useId } from 'react';

interface InternshipAssistantBotProps {
  className?: string;
  greeting?: string;
  /** `full` = bulle + robot (overlay), `avatar` = robot seul pour icônes inline */
  variant?: 'full' | 'avatar';
  /** Afficher la bulle SVG (désactivable si bulle HTML séparée) */
  showBubble?: boolean;
  /** Animation bras + léger flottement (overlay / états vides) */
  animated?: boolean;
  ariaLabel?: string;
}

const InternshipAssistantBot: FunctionComponent<InternshipAssistantBotProps> = ({
  className,
  greeting = 'Hello!',
  variant = 'full',
  showBubble = true,
  animated = false,
  ariaLabel,
}) => {
  const uid = useId().replace(/:/g, '');
  const isAvatar = variant === 'avatar';
  const displayBubble = !isAvatar && showBubble;
  const label = ariaLabel ?? (displayBubble ? greeting : 'Assistant IA');

  const armPath = isAvatar
    ? 'M108 88 C102 80 98 73 94 68'
    : 'M108 88 C98 78 88 66 78 56';

  const handX = isAvatar ? 94 : 78;
  const handY = isAvatar ? 68 : 56;
  const handR = isAvatar ? 4.5 : 6;

  const rightArmPath = isAvatar
    ? 'M152 90 C158 93 161 97 163 100'
    : 'M152 90 C159 93 163 97 165 101';

  const viewBox = displayBubble ? '0 0 180 130' : '72 0 108 130';

  return (
    <svg
      className={`${animated ? 'sr-acc-bot--animated' : ''}${className ? ` ${className}` : ''}`}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={label}
    >
      <defs>
        <linearGradient id={`${uid}-head`} x1="98" y1="18" x2="162" y2="78" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="38%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id={`${uid}-body`} x1="108" y1="78" x2="152" y2="118" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="45%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e40af" />
        </linearGradient>
        <linearGradient id={`${uid}-arm`} x1="88" y1="72" x2="108" y2="98" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <radialGradient id={`${uid}-head-shine`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(118 34) rotate(90) scale(22)">
          <stop stopColor="#dbeafe" stopOpacity="0.9" />
          <stop offset="1" stopColor="#dbeafe" stopOpacity="0" />
        </radialGradient>
        <filter id={`${uid}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#1e40af" floodOpacity="0.4" />
        </filter>
        <filter id={`${uid}-bubble-glow`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#60a5fa" floodOpacity="0.55" />
        </filter>
      </defs>

      <g filter={`url(#${uid}-shadow)`}>
        {displayBubble && (
          <g filter={`url(#${uid}-bubble-glow)`}>
            <rect x="8" y="20" width="76" height="34" rx="14" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1" />
            <path
              d="M72 54 C78 58 82 60 88 62 C82 62 76 64 70 68 Z"
              fill="#eff6ff"
              stroke="#bfdbfe"
              strokeWidth="1"
              strokeLinejoin="round"
            />
            <text
              x="46"
              y="42"
              textAnchor="middle"
              fill="#2563eb"
              fontSize="13"
              fontWeight="700"
              fontFamily="system-ui, -apple-system, Segoe UI, sans-serif"
            >
              {greeting}
            </text>
          </g>
        )}

        <line x1="130" y1="18" x2="130" y2="8" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="130" cy="6" r="4" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="1.5" />

        <circle cx="130" cy="52" r="34" fill={`url(#${uid}-head)`} />
        <ellipse cx="118" cy="34" rx="16" ry="10" fill={`url(#${uid}-head-shine)`} />

        <rect x="104" y="44" width="52" height="18" rx="9" fill="#0f172a" />
        <ellipse cx="118" cy="53" rx="7.5" ry="8.5" fill="#f8fafc" />
        <ellipse cx="142" cy="53" rx="7.5" ry="8.5" fill="#f8fafc" />
        <circle cx="120" cy="54.5" r="3.2" fill="#0f172a" />
        <circle cx="144" cy="54.5" r="3.2" fill="#0f172a" />
        <circle cx="121.2" cy="52.8" r="1.1" fill="#ffffff" />
        <circle cx="145.2" cy="52.8" r="1.1" fill="#ffffff" />

        <path
          d="M122 66 C126 69 134 69 138 66"
          stroke="#1d4ed8"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <ellipse cx="130" cy="98" rx="24" ry="19" fill={`url(#${uid}-body)`} />

        <path
          d={rightArmPath}
          stroke="#2563eb"
          strokeWidth={isAvatar ? 5 : 6}
          strokeLinecap="butt"
          fill="none"
        />

        <g className={animated ? 'internship-status-overlay__bot-arm' : undefined}>
          <path
            d={armPath}
            stroke={`url(#${uid}-arm)`}
            strokeWidth={isAvatar ? 5 : 7}
            strokeLinecap="round"
            fill="none"
          />
          <circle
            cx={handX}
            cy={handY}
            r={handR}
            fill="#93c5fd"
            stroke="#1d4ed8"
            strokeWidth="1.5"
          />
        </g>
      </g>
    </svg>
  );
};

export default InternshipAssistantBot;
