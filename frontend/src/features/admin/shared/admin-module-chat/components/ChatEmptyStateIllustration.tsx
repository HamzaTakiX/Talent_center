import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Calendar,
  FileText,
  Megaphone,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { ChatEmptyModuleType } from '../types/chatEmptyStateTypes';

const ACCENT_ICONS: Partial<Record<ChatEmptyModuleType, LucideIcon>> = {
  internship: Briefcase,
  documents: FileText,
  meetings: Calendar,
  announcements: Megaphone,
  'student-support': Users,
};

const floatTransition = {
  duration: 4,
  repeat: Infinity,
  ease: 'easeInOut' as const,
};

const breatheTransition = {
  duration: 3.5,
  repeat: Infinity,
  ease: 'easeInOut' as const,
};

const orbitTransition = {
  duration: 5,
  repeat: Infinity,
  ease: 'linear' as const,
};

const dotTransition = (delay: number) => ({
  duration: 1.8,
  repeat: Infinity,
  ease: 'easeInOut' as const,
  delay,
});

interface Props {
  moduleType: ChatEmptyModuleType;
}

const ChatEmptyStateIllustration: FunctionComponent<Props> = ({ moduleType }) => {
  const AccentIcon = ACCENT_ICONS[moduleType];

  return (
    <div className="chat-empty-state__illustration" aria-hidden>
      <motion.div
        className="chat-empty-state__glow"
        animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={breatheTransition}
      />

      <motion.div
        className="chat-empty-state__orbit"
        animate={{ rotate: 360 }}
        transition={orbitTransition}
      >
        <motion.span
          className="chat-empty-state__particle chat-empty-state__particle--1"
          animate={{ opacity: [0.25, 0.6, 0.25], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.span
          className="chat-empty-state__particle chat-empty-state__particle--2"
          animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.15, 1] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        />
        <motion.span
          className="chat-empty-state__particle chat-empty-state__particle--3"
          animate={{ opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        />
      </motion.div>

      <motion.div
        className="chat-empty-state__bubble-wrap"
        animate={{ y: [0, -6, 0, 6, 0] }}
        transition={floatTransition}
      >
        <svg
          className="chat-empty-state__bubble-svg"
          viewBox="0 0 88 88"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="8"
            y="14"
            width="64"
            height="48"
            rx="14"
            fill="var(--admin-bg-elevated)"
            stroke="color-mix(in srgb, var(--admin-brand) 28%, var(--admin-border))"
            strokeWidth="1.5"
          />
          <path
            d="M22 62 L14 74 L30 64 Z"
            fill="var(--admin-bg-elevated)"
            stroke="color-mix(in srgb, var(--admin-brand) 28%, var(--admin-border))"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <motion.circle
            cx="28"
            cy="38"
            r="3.5"
            fill="var(--admin-brand)"
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={dotTransition(0)}
          />
          <motion.circle
            cx="40"
            cy="38"
            r="3.5"
            fill="var(--admin-brand)"
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={dotTransition(0.35)}
          />
          <motion.circle
            cx="52"
            cy="38"
            r="3.5"
            fill="var(--admin-brand)"
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={dotTransition(0.7)}
          />
          <motion.path
            d="M24 50 H56"
            stroke="color-mix(in srgb, var(--admin-brand) 20%, var(--admin-border))"
            strokeWidth="2"
            strokeLinecap="round"
            animate={{ opacity: [0.4, 0.75, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>

        {AccentIcon ? (
          <motion.div
            className="chat-empty-state__accent"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          >
            <AccentIcon className="chat-empty-state__accent-icon" strokeWidth={2} aria-hidden />
          </motion.div>
        ) : null}
      </motion.div>
    </div>
  );
};

export default ChatEmptyStateIllustration;
