import type { InterviewDifficulty, SimulatorConfig } from '../types/interviewSimulatorDashboard';
import { INTERVIEW_STUDENT_PROFILE } from '../data/interviewSimulatorDashboardMock';
import { QUESTIONS_BY_LENGTH } from '../data/interviewConfigMock';

const SCORE_RANGE: Record<InterviewDifficulty, [number, number]> = {
  beginner: [68, 88],
  intermediate: [58, 78],
  advanced: [48, 72],
  expert: [38, 65],
};

export function estimatedQuestions(length: SimulatorConfig['length']): number {
  return QUESTIONS_BY_LENGTH[length] ?? 5;
}

export function expectedScoreRange(difficulty: InterviewDifficulty): [number, number] {
  return SCORE_RANGE[difficulty];
}

export function confidencePrediction(readiness = INTERVIEW_STUDENT_PROFILE.readinessScore): number {
  return Math.min(95, Math.max(42, readiness + 6));
}

export function preparationLabelKey(readiness = INTERVIEW_STUDENT_PROFILE.readinessScore): string {
  if (readiness >= 80) return 'student.internshipOffers.interviewSim.config.review.prep.excellent';
  if (readiness >= 65) return 'student.internshipOffers.interviewSim.config.review.prep.good';
  if (readiness >= 50) return 'student.internshipOffers.interviewSim.config.review.prep.moderate';
  return 'student.internshipOffers.interviewSim.config.review.prep.needsWork';
}

export function interviewerPreview(config: SimulatorConfig) {
  const seniority =
    config.difficulty === 'expert' || config.difficulty === 'advanced' ? 'senior' : 'mid';

  const roleSlug = config.role.toLowerCase();
  let title = 'Senior Engineering Manager';
  let styleKey = 'student.internshipOffers.interviewSim.config.review.interviewer.style.balanced';

  if (roleSlug.includes('frontend') || roleSlug.includes('ui')) {
    title = seniority === 'senior' ? 'Senior Frontend Engineer' : 'Frontend Tech Lead';
    styleKey = 'student.internshipOffers.interviewSim.config.review.interviewer.style.frontend';
  } else if (roleSlug.includes('backend') || roleSlug.includes('devops')) {
    title = seniority === 'senior' ? 'Senior Backend Engineer' : 'Backend Tech Lead';
    styleKey = 'student.internshipOffers.interviewSim.config.review.interviewer.style.technical';
  } else if (roleSlug.includes('data')) {
    title = seniority === 'senior' ? 'Lead Data Scientist' : 'Data Science Manager';
    styleKey = 'student.internshipOffers.interviewSim.config.review.interviewer.style.analytical';
  } else if (config.modeId === 'behavioral' || config.modeId === 'hr') {
    title = 'Senior HR Business Partner';
    styleKey = 'student.internshipOffers.interviewSim.config.review.interviewer.style.behavioral';
  }

  const experienceYears = config.difficulty === 'expert' ? '12+' : config.difficulty === 'advanced' ? '10+' : '7+';

  return { title, styleKey, experienceYears };
}

export function interviewerTypeKey(config: SimulatorConfig): string {
  if (config.modeId === 'technical') {
    return 'student.internshipOffers.interviewSim.config.review.interviewerType.technical';
  }
  if (config.modeId === 'behavioral') {
    return 'student.internshipOffers.interviewSim.config.review.interviewerType.behavioral';
  }
  if (config.modeId === 'hr') {
    return 'student.internshipOffers.interviewSim.config.review.interviewerType.hr';
  }
  return 'student.internshipOffers.interviewSim.config.review.interviewerType.hybrid';
}
