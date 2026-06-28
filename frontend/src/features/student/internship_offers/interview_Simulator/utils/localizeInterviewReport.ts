import type { TFunction } from 'i18next';
import type { InterviewSimulationReport } from '../../types/offerAiCoach';

const REPORT_PREFIX = 'student.internshipOffers.interviewSim.report';

function translateKey(t: TFunction, suffix: string, fallback: string): string {
  const key = `${REPORT_PREFIX}.${suffix}`;
  const translated = t(key);
  return translated === key ? fallback : translated;
}

export function getReportReadinessLabel(readinessKey: string, t: TFunction): string {
  return translateKey(t, `readiness.${readinessKey}`, readinessKey);
}

export function localizeInterviewReport(
  report: InterviewSimulationReport,
  t: TFunction,
): InterviewSimulationReport {
  const isInsufficient =
    report.answers_analyzed === 0
    || report.readiness_key === 'insufficient_data'
    || report.insufficient_data;

  return {
    ...report,
    readiness_text: getReportReadinessLabel(report.readiness_key, t),
    categories: report.categories.map((cat) => ({
      ...cat,
      label: translateKey(t, `categories.${cat.id}`, cat.label),
    })),
    speech_metrics: report.speech_metrics.map((metric) => ({
      ...metric,
      label: translateKey(t, `speechMetrics.${metric.id}`, metric.label),
      detail: isInsufficient && metric.id === 'pace'
        ? translateKey(t, 'insufficient.noAnswersRecorded', metric.detail ?? '')
        : metric.detail,
      assessment:
        metric.assessment && metric.assessment !== '—'
          ? translateKey(t, `assessments.${metric.trend ?? 'neutral'}`, metric.assessment)
          : metric.assessment,
    })),
    weaknesses: isInsufficient
      ? [translateKey(t, 'insufficient.detail', report.weaknesses[0] ?? '')]
      : report.weaknesses,
    recommendations: isInsufficient
      ? [translateKey(t, 'insufficient.recommendation', report.recommendations[0] ?? '')]
      : report.recommendations,
  };
}
