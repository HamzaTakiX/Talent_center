import { FunctionComponent } from 'react';
import { Briefcase, MessageCircle, Upload, LucideIcon } from 'lucide-react';
import type { InterviewSimulatorActionVariant } from '../types';
import {
  IS_ACTION_BTN_COMPANY,
  IS_ACTION_BTN_OFFER,
  IS_ACTION_BTN_UPLOAD,
} from '../constants/interviewSimulatorStyles';

const variantConfig: Record<
  InterviewSimulatorActionVariant,
  { className: string; Icon: LucideIcon }
> = {
  upload: { className: IS_ACTION_BTN_UPLOAD, Icon: Upload },
  offer: { className: IS_ACTION_BTN_OFFER, Icon: Briefcase },
  company: { className: IS_ACTION_BTN_COMPANY, Icon: MessageCircle },
};

interface InterviewSimulatorActionButtonProps {
  label: string;
  variant: InterviewSimulatorActionVariant;
  onClick?: () => void;
}

const InterviewSimulatorActionButton: FunctionComponent<InterviewSimulatorActionButtonProps> = ({
  label,
  variant,
  onClick,
}) => {
  const { className, Icon } = variantConfig[variant];

  return (
    <button type="button" className={className} onClick={onClick}>
      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
      <span>{label}</span>
    </button>
  );
};

export default InterviewSimulatorActionButton;
