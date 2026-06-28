import {
  ClipboardCheck,
  Link2,
  MessageSquare,
  Settings,
  Target,
  type LucideIcon,
} from 'lucide-react';
import type { SimulationBasis, SimulatorConfig } from '../types/interviewSimulatorDashboard';

export type WizardStepId = 'basis' | 'offerData' | 'interviewType' | 'settings' | 'review';

export interface WizardStepDef {
  id: WizardStepId;
  icon: LucideIcon;
  labelKey: string;
}

const BASIS_STEP: WizardStepDef = {
  id: 'basis',
  icon: Target,
  labelKey: 'student.internshipOffers.interviewSim.config.steps.basis',
};

const OFFER_DATA_STEP: WizardStepDef = {
  id: 'offerData',
  icon: Link2,
  labelKey: 'student.internshipOffers.interviewSim.config.steps.offerData',
};

const INTERVIEW_TYPE_STEP: WizardStepDef = {
  id: 'interviewType',
  icon: MessageSquare,
  labelKey: 'student.internshipOffers.interviewSim.config.steps.interviewType',
};

const SETTINGS_STEP: WizardStepDef = {
  id: 'settings',
  icon: Settings,
  labelKey: 'student.internshipOffers.interviewSim.config.steps.settings',
};

const REVIEW_STEP: WizardStepDef = {
  id: 'review',
  icon: ClipboardCheck,
  labelKey: 'student.internshipOffers.interviewSim.config.steps.review',
};

export interface WizardStepsOptions {
  linkedOfferId?: string;
}

export function getWizardSteps(basis?: SimulationBasis, options?: WizardStepsOptions): WizardStepDef[] {
  if (options?.linkedOfferId) {
    return [INTERVIEW_TYPE_STEP, SETTINGS_STEP, REVIEW_STEP];
  }
  if (basis === 'offer') {
    return [BASIS_STEP, OFFER_DATA_STEP, INTERVIEW_TYPE_STEP, SETTINGS_STEP, REVIEW_STEP];
  }
  return [BASIS_STEP, INTERVIEW_TYPE_STEP, SETTINGS_STEP, REVIEW_STEP];
}

export function getStepId(steps: WizardStepDef[], index: number): WizardStepId | undefined {
  return steps[index]?.id;
}

export function canProceedWizardStep(stepId: WizardStepId | undefined, config: SimulatorConfig): boolean {
  switch (stepId) {
    case 'basis':
      return !!config.basis;
    case 'offerData':
      if (config.offerInputMode === 'url') {
        const hasContent = Boolean(
          config.customJobTitle?.trim() ||
            config.customCompany?.trim() ||
            config.customDescription?.trim(),
        );
        return !!(config.offerUrl?.trim() && config.extractedOfferPreview && hasContent);
      }
      return !!(config.customCompany?.trim() && config.customDescription?.trim());
    case 'interviewType':
      return !!config.interviewFocus;
    case 'settings':
      return !!(
        config.interviewerGender &&
        config.language &&
        config.length &&
        config.difficulty &&
        config.experienceLevel
      );
    case 'review':
      return true;
    default:
      return false;
  }
}

export function patchForBasisChange(basis: SimulationBasis): Partial<SimulatorConfig> {
  return {
    basis,
    interviewFocus: undefined,
    offerInputMode: basis === 'offer' ? 'url' : undefined,
    offerUrl: undefined,
    offerImportJobUuid: undefined,
    extractedOfferPreview: undefined,
    customJobTitle: undefined,
    customCompany: undefined,
    customDescription: undefined,
  };
}
