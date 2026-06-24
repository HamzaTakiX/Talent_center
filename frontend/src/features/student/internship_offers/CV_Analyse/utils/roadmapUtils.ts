import type { CvRoadmapStep } from '../types/cvAnalysisDashboard';
import { STUDENT_CV_BUILDER_PATH } from '../../cv_builder/constants/routes';
import { STUDENT_INTERNSHIP_OFFERS_PATH } from '../../constants/routes';

export type RoadmapLayout = 'empty' | 'single' | 'compact' | 'timeline' | 'collapsible';

const COLLAPSIBLE_THRESHOLD = 5;
const COMPACT_MAX = 3;
const TIMELINE_MIN = 4;

export function getRoadmapLayout(stepCount: number): RoadmapLayout {
  if (stepCount === 0) return 'empty';
  if (stepCount === 1) return 'single';
  if (stepCount <= COMPACT_MAX) return 'compact';
  if (stepCount >= COLLAPSIBLE_THRESHOLD) return 'collapsible';
  return 'timeline';
}

export function getRoadmapScoreGain(step: CvRoadmapStep): number {
  if (step.scoreGain != null) return step.scoreGain;
  const impact = step.impact ?? 'medium';
  if (impact === 'high') return 12;
  if (impact === 'low') return 3;
  return 7;
}

export function resolveRoadmapAction(step: CvRoadmapStep): { actionKey: string; href: string } {
  if (step.actionKey) {
    return { actionKey: step.actionKey, href: resolveActionHref(step.actionKey) };
  }

  const title = (step.titleKey || '').toLowerCase();
  if (/postul|offre|apply|stage|intern|matching|candidat/.test(title)) {
    return {
      actionKey: 'student.internshipOffers.cvDashboard.roadmap.actions.viewOffers',
      href: STUDENT_INTERNSHIP_OFFERS_PATH,
    };
  }
  if (/github|portfolio|profil|résumé|resume|summary|linkedin|cv/.test(title)) {
    return {
      actionKey: 'student.internshipOffers.cvDashboard.roadmap.actions.updateProfile',
      href: STUDENT_CV_BUILDER_PATH,
    };
  }
  return {
    actionKey: 'student.internshipOffers.cvDashboard.roadmap.actions.improve',
    href: STUDENT_CV_BUILDER_PATH,
  };
}

function resolveActionHref(actionKey: string): string {
  if (actionKey.includes('viewOffers')) return STUDENT_INTERNSHIP_OFFERS_PATH;
  if (actionKey.includes('updateProfile') || actionKey.includes('improve')) {
    return STUDENT_CV_BUILDER_PATH;
  }
  return STUDENT_CV_BUILDER_PATH;
}
