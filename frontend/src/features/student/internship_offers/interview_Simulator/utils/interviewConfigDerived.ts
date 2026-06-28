import type { TFunction } from 'i18next';
import type { InterviewDifficulty, SimulatorConfig } from '../types/interviewSimulatorDashboard';
import { INTERVIEW_STUDENT_PROFILE } from '../data/interviewSimulatorDashboardMock';
import { BASIS_SIDEBAR_PREVIEW, QUESTIONS_BY_LENGTH } from '../data/interviewConfigMock';

const SCORE_RANGE: Record<InterviewDifficulty, [number, number]> = {
  beginner: [68, 88],
  intermediate: [58, 78],
  advanced: [48, 72],
  expert: [38, 65],
};

const EXPERIENCE_YEARS: Record<NonNullable<SimulatorConfig['experienceLevel']>, string> = {
  intern: '3+',
  junior: '5+',
  mid: '7+',
  senior: '10+',
};

export function estimatedQuestions(length: SimulatorConfig['length']): number {
  return QUESTIONS_BY_LENGTH[length] ?? 5;
}

export function expectedScoreRange(difficulty: InterviewDifficulty): [number, number] {
  return SCORE_RANGE[difficulty];
}

export function readinessScoreForConfig(
  config: SimulatorConfig,
  studentReadiness = INTERVIEW_STUDENT_PROFILE.readinessScore,
): number {
  if (config.basis) return BASIS_SIDEBAR_PREVIEW[config.basis].readinessScore;
  return studentReadiness;
}

export function confidencePrediction(readiness = INTERVIEW_STUDENT_PROFILE.readinessScore): number {
  return Math.min(95, Math.max(42, readiness + 6));
}

export function preparationLabelKey(
  config: SimulatorConfig,
  studentReadiness = INTERVIEW_STUDENT_PROFILE.readinessScore,
): string {
  const readiness = readinessScoreForConfig(config, studentReadiness);
  if (readiness >= 80) return 'student.internshipOffers.interviewSim.config.review.prep.excellent';
  if (readiness >= 65) return 'student.internshipOffers.interviewSim.config.review.prep.good';
  if (readiness >= 50) return 'student.internshipOffers.interviewSim.config.review.prep.moderate';
  return 'student.internshipOffers.interviewSim.config.review.prep.needsWork';
}

export function interviewerTypeKey(config: SimulatorConfig): string {
  if (config.interviewFocus === 'technical') {
    return 'student.internshipOffers.interviewSim.config.review.interviewerType.technical';
  }
  if (config.interviewFocus === 'hr') {
    return 'student.internshipOffers.interviewSim.config.review.interviewerType.hr';
  }
  if (config.interviewFocus === 'mixed') {
    return 'student.internshipOffers.interviewSim.config.review.interviewerType.hybrid';
  }
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

function interviewerStyleKey(config: SimulatorConfig): string {
  if (config.interviewFocus === 'hr') {
    return 'student.internshipOffers.interviewSim.config.review.interviewer.style.behavioral';
  }
  if (config.interviewFocus === 'technical') {
    return 'student.internshipOffers.interviewSim.config.review.interviewer.style.technical';
  }
  if (config.interviewFocus === 'mixed') {
    return 'student.internshipOffers.interviewSim.config.review.interviewer.style.balanced';
  }
  return 'student.internshipOffers.interviewSim.config.review.interviewer.style.balanced';
}

function interviewerTitleKey(config: SimulatorConfig): string {
  const prefix = 'student.internshipOffers.interviewSim.config.review.interviewer.titles';
  const scope = config.basis === 'offer' ? 'Offer' : 'Personal';

  if (config.interviewFocus === 'hr') return `${prefix}.hr${scope}`;
  if (config.interviewFocus === 'technical') return `${prefix}.technical${scope}`;
  if (config.interviewFocus === 'mixed') return `${prefix}.mixed${scope}`;
  return `${prefix}.default`;
}

export function interviewerPreview(config: SimulatorConfig, t: TFunction) {
  const titleKey = interviewerTitleKey(config);
  const company = config.customCompany?.trim() || '—';
  const jobTitle = config.customJobTitle?.trim();

  const title = t(titleKey, {
    company,
    jobTitle: jobTitle || t('student.internshipOffers.interviewSim.config.offerData.defaultTitle'),
  });

  const genderLabel = config.interviewerGender
    ? t(`student.internshipOffers.interviewSim.config.settings.gender.${config.interviewerGender}`)
    : '—';

  const focusLabel = config.interviewFocus
    ? t(`student.internshipOffers.interviewSim.config.interviewType.${config.interviewFocus}.title`)
    : '—';

  const experienceYears =
    (config.experienceLevel && EXPERIENCE_YEARS[config.experienceLevel]) ||
    (config.difficulty === 'expert' ? '12+' : config.difficulty === 'advanced' ? '10+' : '7+');

  return {
    title,
    genderLabel,
    focusLabel,
    styleKey: interviewerStyleKey(config),
    experienceYears,
  };
}

export interface ReviewSummaryRow {
  label: string;
  value: string;
  kind?: 'url';
  fullValue?: string;
}

function compactUrlForDisplay(url: string): string {
  const raw = url.trim();
  if (!raw) return '';
  try {
    const u = new URL(raw);
    const host = u.host;
    const path = u.pathname.replace(/\/+$/, '');
    const base = `${host}${path}`;
    const queryHint = u.search ? '…' : '';
    const text = `${base}${queryHint}`;
    if (text.length <= 52) return text;
    const head = text.slice(0, 34);
    const tail = text.slice(-14);
    return `${head}…${tail}`;
  } catch {
    const text = raw.replace(/^https?:\/\//i, '');
    if (text.length <= 52) return text;
    return `${text.slice(0, 34)}…${text.slice(-14)}`;
  }
}

export function buildReviewSummaryRows(
  config: SimulatorConfig,
  t: TFunction,
  options?: { studentName?: string; studentProgram?: string; studentReadiness?: number },
): ReviewSummaryRow[] {
  const questions = estimatedQuestions(config.length);
  const [scoreMin, scoreMax] = expectedScoreRange(config.difficulty);
  const readiness = readinessScoreForConfig(config, options?.studentReadiness);

  const basisLabel =
    config.basis === 'offer'
      ? t('student.internshipOffers.interviewSim.config.basis.offer.title')
      : t('student.internshipOffers.interviewSim.config.basis.personal.title');

  const focusLabel = config.interviewFocus
    ? t(`student.internshipOffers.interviewSim.config.interviewType.${config.interviewFocus}.title`)
    : '—';

  const rows: ReviewSummaryRow[] = [
    { label: t('student.internshipOffers.interviewSim.config.review.labels.basis'), value: basisLabel },
    { label: t('student.internshipOffers.interviewSim.config.review.labels.interviewType'), value: focusLabel },
  ];

  if (config.basis === 'personal') {
    if (options?.studentName) {
      rows.push({
        label: t('student.internshipOffers.interviewSim.config.review.labels.candidate'),
        value: options.studentName,
      });
    }
    if (options?.studentProgram) {
      rows.push({
        label: t('student.internshipOffers.interviewSim.config.review.labels.program'),
        value: options.studentProgram,
      });
    }
  }

  if (config.basis === 'offer') {
    const urlValue =
      config.offerInputMode === 'url' && config.offerUrl?.trim() ? config.offerUrl.trim() : null;

    rows.push({
      label: t('student.internshipOffers.interviewSim.config.review.labels.offerSource'),
      value: config.linkedOfferId
        ? t('student.internshipOffers.interviewSim.config.review.labels.platformOffer')
        : urlValue
          ? compactUrlForDisplay(urlValue)
          : t('student.internshipOffers.interviewSim.config.review.labels.manualEntry'),
      kind: urlValue ? 'url' : undefined,
      fullValue: urlValue ?? undefined,
    });
    rows.push({
      label: t('student.internshipOffers.interviewSim.config.review.labels.company'),
      value: config.customCompany?.trim() || '—',
    });
    rows.push({
      label: t('student.internshipOffers.interviewSim.config.review.labels.role'),
      value: config.customJobTitle?.trim() || '—',
    });
  }

  rows.push(
    {
      label: t('student.internshipOffers.interviewSim.config.review.labels.gender'),
      value: config.interviewerGender
        ? t(`student.internshipOffers.interviewSim.config.settings.gender.${config.interviewerGender}`)
        : '—',
    },
    {
      label: t('student.internshipOffers.interviewSim.config.review.labels.experience'),
      value: config.experienceLevel
        ? t(`student.internshipOffers.interviewSim.config.settings.experienceLevels.${config.experienceLevel}`)
        : '—',
    },
    {
      label: t('student.internshipOffers.interviewSim.config.review.labels.difficulty'),
      value: t(`student.internshipOffers.interviewSim.config.difficulty.${config.difficulty}`),
    },
    {
      label: t('student.internshipOffers.interviewSim.config.review.labels.duration'),
      value: `${config.length} min`,
    },
    {
      label: t('student.internshipOffers.interviewSim.config.review.labels.language'),
      value: t(`student.internshipOffers.interviewSim.config.language.${config.language}`),
    },
    {
      label: t('student.internshipOffers.interviewSim.config.review.labels.questions'),
      value: String(questions),
    },
    {
      label: t('student.internshipOffers.interviewSim.config.review.labels.scoreRange'),
      value: `${scoreMin}–${scoreMax}%`,
    },
    {
      label: t('student.internshipOffers.interviewSim.config.review.labels.readiness'),
      value: `${readiness}/100`,
    },
    {
      label: t('student.internshipOffers.interviewSim.config.review.labels.preparation'),
      value: t(preparationLabelKey(config, options?.studentReadiness)),
    },
    {
      label: t('student.internshipOffers.interviewSim.config.review.labels.interviewerType'),
      value: t(interviewerTypeKey(config)),
    },
  );

  return rows;
}
