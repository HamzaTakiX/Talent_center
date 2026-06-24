import { jsPDF } from 'jspdf';
import type { TFunction } from 'i18next';
import type {
  CvAnalysisDashboardData,
  CvAnalysisInsightsGroup,
  CvInternshipMatch,
  CvRecommendation,
  CvRoadmapStep,
  CvScoreTone,
} from '../types/cvAnalysisDashboard';
import { getScoreTone } from './cvAnalysisScore';
import { formatInterviewSuggestionTitle, resolveDynamicLabel } from './resolveDynamicLabel';
import { getRoadmapScoreGain } from './roadmapUtils';

const SCORE_COLORS: Record<CvScoreTone, string> = {
  low: '#ef4444',
  medium: '#f59e0b',
  high: '#10b981',
};

const INSIGHT_COLORS: Record<CvAnalysisInsightsGroup['category'], { bg: string; border: string; accent: string }> = {
  strengths: { bg: '#ecfdf5', border: '#a7f3d0', accent: '#059669' },
  weaknesses: { bg: '#fef2f2', border: '#fecaca', accent: '#dc2626' },
  opportunities: { bg: '#eff6ff', border: '#bfdbfe', accent: '#2563eb' },
  risks: { bg: '#fffbeb', border: '#fde68a', accent: '#d97706' },
};

const PRIORITY_COLORS = {
  high: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
  medium: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
  low: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function scoreBar(score: number, color: string): string {
  const clamped = Math.max(0, Math.min(100, score));
  return `
    <div style="height:8px;border-radius:999px;background:#e5e7eb;overflow:hidden;margin-top:6px;">
      <div style="height:100%;width:${clamped}%;background:${color};border-radius:999px;"></div>
    </div>
  `;
}

function matchLevelLabel(level: CvInternshipMatch['matchLevel']): string {
  switch (level) {
    case 'strong':
      return 'Forte';
    case 'partial':
      return 'Partielle';
    case 'weak':
      return 'Faible';
    case 'none':
      return 'Non compatible';
    default:
      return '';
  }
}

function buildReportHtml(data: CvAnalysisDashboardData, t: TFunction): string {
  const { profile, meta, breakdown, insights, detectedSkills, missingSkills, internshipMatches, recommendations, roadmap, interviewSuggestions } = data;
  const generatedAt = new Date().toLocaleString('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
  const overallTone = getScoreTone(meta.overallScore);
  const potentialTone = getScoreTone(meta.potentialScore);

  const breakdownHtml = breakdown
    .map((item) => {
      const tone = getScoreTone(item.score);
      const color = SCORE_COLORS[tone];
      const suffix = item.id === 'ats' || item.id === 'readiness' ? '%' : '/100';
      return `
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:14px 16px;">
          <div style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;">${escapeHtml(t(item.labelKey))}</div>
          <div style="font-size:22px;font-weight:800;color:${color};margin-top:4px;">${item.score}${suffix === '%' ? '%' : `<span style="font-size:13px;font-weight:600;color:#9ca3af;"> / 100</span>`}</div>
          ${scoreBar(item.score, color)}
        </div>
      `;
    })
    .join('');

  const insightsHtml = insights
    .filter((group) => group.items.length > 0)
    .map((group) => {
      const palette = INSIGHT_COLORS[group.category];
      const items = group.items
        .map((item) => `<li style="margin:0 0 6px 0;line-height:1.5;">${escapeHtml(item.text)}</li>`)
        .join('');
      return `
        <div style="background:${palette.bg};border:1px solid ${palette.border};border-radius:12px;padding:14px 16px;">
          <div style="font-size:12px;font-weight:700;color:${palette.accent};text-transform:uppercase;letter-spacing:0.04em;margin-bottom:8px;">
            ${escapeHtml(t(`student.internshipOffers.cvDashboard.ai.${group.category}`))}
          </div>
          <ul style="margin:0;padding-left:18px;font-size:12px;color:#374151;">${items}</ul>
        </div>
      `;
    })
    .join('');

  const detectedSkillsHtml = detectedSkills.length
    ? detectedSkills
        .map(
          (skill) =>
            `<span style="display:inline-block;background:#ecfdf5;color:#047857;border:1px solid #a7f3d0;border-radius:999px;padding:4px 10px;font-size:11px;font-weight:600;margin:0 6px 6px 0;">${escapeHtml(skill.name)}</span>`,
        )
        .join('')
    : `<p style="margin:0;font-size:12px;color:#6b7280;">${escapeHtml(t('student.internshipOffers.cvDashboard.skills.noDetected'))}</p>`;

  const missingSkillsHtml = missingSkills.length
    ? missingSkills
        .map((skill) => {
          const priority = skill.priority ?? 'optional';
          const priorityLabel = t(`student.internshipOffers.cvDashboard.skills.priority.${priority}`);
          return `<span style="display:inline-block;background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;border-radius:999px;padding:4px 10px;font-size:11px;font-weight:600;margin:0 6px 6px 0;">${escapeHtml(skill.name)} <span style="opacity:0.75;">· ${escapeHtml(priorityLabel)}</span></span>`;
        })
        .join('')
    : `<p style="margin:0;font-size:12px;color:#6b7280;">${escapeHtml(t('student.internshipOffers.cvDashboard.skills.noMissing'))}</p>`;

  const matchesHtml = internshipMatches.length
    ? internshipMatches
        .map((match) => {
          const level = matchLevelLabel(match.matchLevel);
          const rows = [
            { label: t('student.internshipOffers.cvDashboard.compatibility.skills'), val: match.breakdown.skills },
            { label: t('student.internshipOffers.cvDashboard.compatibility.location'), val: match.breakdown.location },
            { label: t('student.internshipOffers.cvDashboard.compatibility.experience'), val: match.breakdown.experience },
            { label: t('student.internshipOffers.cvDashboard.compatibility.education'), val: match.breakdown.education },
          ]
            .map(
              (row) => `
              <div style="display:flex;align-items:center;gap:8px;font-size:11px;color:#4b5563;margin-top:4px;">
                <span style="width:110px;flex-shrink:0;">${escapeHtml(row.label)}</span>
                <div style="flex:1;">${scoreBar(row.val, '#6366f1')}</div>
                <span style="width:32px;text-align:right;font-weight:700;">${row.val}%</span>
              </div>
            `,
            )
            .join('');
          return `
            <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:14px 16px;margin-bottom:10px;">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
                <div>
                  <div style="font-size:14px;font-weight:700;color:#111827;">${escapeHtml(match.title)}</div>
                  <div style="font-size:11px;color:#6b7280;margin-top:2px;">${escapeHtml(match.company)} · ${escapeHtml(match.location)}</div>
                  ${level ? `<span style="display:inline-block;margin-top:6px;background:#eef2ff;color:#4338ca;border-radius:999px;padding:2px 8px;font-size:10px;font-weight:700;">${escapeHtml(level)}</span>` : ''}
                </div>
                <div style="font-size:24px;font-weight:800;color:#4f46e5;flex-shrink:0;">${match.matchPercent}%</div>
              </div>
              ${match.explanation ? `<p style="margin:10px 0 0;font-size:11px;color:#4b5563;line-height:1.5;">${escapeHtml(match.explanation)}</p>` : ''}
              <div style="margin-top:10px;">${rows}</div>
            </div>
          `;
        })
        .join('')
    : `<p style="margin:0;font-size:12px;color:#6b7280;">${escapeHtml(t('student.internshipOffers.cvDashboard.compatibility.empty', { defaultValue: 'Aucune offre publiée disponible pour le moment.' }))}</p>`;

  const recsByPriority = (['high', 'medium', 'low'] as const).map((priority) => {
    const items = recommendations.filter((r) => r.priority === priority);
    if (!items.length) return '';
    const palette = PRIORITY_COLORS[priority];
    const cards = items
      .map((rec: CvRecommendation) => {
        const title = resolveDynamicLabel(t, rec.titleKey, rec.isDynamic);
        const description = resolveDynamicLabel(t, rec.descriptionKey, rec.isDynamic);
        return `
          <div style="background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:12px 14px;margin-bottom:8px;">
            <div style="font-size:13px;font-weight:700;color:#111827;">${escapeHtml(title)}</div>
            <div style="font-size:11px;color:#4b5563;margin-top:4px;line-height:1.5;">${escapeHtml(description)}</div>
            <div style="display:flex;gap:12px;margin-top:8px;font-size:10px;color:#6b7280;">
              <span><strong style="color:#059669;">+${rec.scoreGain}</strong> ${escapeHtml(t('student.internshipOffers.cvDashboard.recs.points'))}</span>
              <span>${escapeHtml(t('student.internshipOffers.cvDashboard.recs.impact'))}: ${rec.impactLevel}/10</span>
            </div>
          </div>
        `;
      })
      .join('');
    return `
      <div style="margin-bottom:14px;">
        <div style="display:inline-block;background:${palette.bg};color:${palette.text};border:1px solid ${palette.border};border-radius:999px;padding:4px 10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:8px;">
          ${escapeHtml(t(`student.internshipOffers.cvDashboard.recs.priority.${priority}`))}
        </div>
        ${cards}
      </div>
    `;
  }).join('');

  const roadmapHtml = roadmap.length
    ? roadmap
        .map((step: CvRoadmapStep) => {
          const title = resolveDynamicLabel(t, step.titleKey, step.isDynamic ?? true);
          const description = step.description
            ? resolveDynamicLabel(t, step.description, step.isDynamic ?? true)
            : '';
          const gain = getRoadmapScoreGain(step);
          return `
            <div style="display:flex;gap:12px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:12px 14px;margin-bottom:8px;">
              <div style="width:28px;height:28px;border-radius:999px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${step.step}</div>
              <div style="flex:1;">
                <div style="font-size:13px;font-weight:700;color:#111827;">${escapeHtml(title)}</div>
                ${description ? `<div style="font-size:11px;color:#4b5563;margin-top:3px;line-height:1.5;">${escapeHtml(description)}</div>` : ''}
                <div style="font-size:10px;color:#059669;font-weight:700;margin-top:6px;">${escapeHtml(t('student.internshipOffers.cvDashboard.roadmap.potentialGain', { points: gain }))}</div>
              </div>
            </div>
          `;
        })
        .join('')
    : `<p style="margin:0;font-size:12px;color:#6b7280;">${escapeHtml(t('student.internshipOffers.cvDashboard.roadmap.emptyTitle'))}</p>`;

  const interviewHtml = interviewSuggestions
    .map((suggestion, index) => {
      const title = formatInterviewSuggestionTitle(resolveDynamicLabel(t, suggestion.titleKey, true));
      const typeLabel = t(`student.internshipOffers.cvDashboard.interview.types.${suggestion.type}`, suggestion.type);
      return `
        <div style="display:flex;gap:10px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:12px 14px;margin-bottom:8px;">
          <div style="width:24px;height:24px;border-radius:8px;background:#eef2ff;color:#4f46e5;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${index + 1}</div>
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:700;color:#111827;">${escapeHtml(title)}</div>
            ${suggestion.reason ? `<div style="font-size:11px;color:#4b5563;margin-top:3px;">${escapeHtml(suggestion.reason)}</div>` : ''}
          </div>
          <span style="align-self:flex-start;background:#f5f3ff;color:#6d28d9;border-radius:999px;padding:3px 8px;font-size:10px;font-weight:700;white-space:nowrap;">${escapeHtml(typeLabel)}</span>
        </div>
      `;
    })
    .join('');

  const cvSourceLabel = data.isDefaultCv !== false
    ? t('student.internshipOffers.cvDashboard.hero.defaultCvBadge')
    : t('student.internshipOffers.cvDashboard.hero.importOtherCv');

  return `
    <div style="font-family:'Segoe UI',Inter,system-ui,sans-serif;color:#111827;line-height:1.45;">
      <div style="background:linear-gradient(135deg,#312e81 0%,#4f46e5 45%,#7c3aed 100%);border-radius:16px;padding:28px 32px;color:#fff;margin-bottom:24px;">
        <div style="font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;opacity:0.85;">Talent Center · Rapport IA</div>
        <h1 style="margin:8px 0 0;font-size:26px;font-weight:800;letter-spacing:-0.02em;">${escapeHtml(t('student.internshipOffers.cvDashboard.hero.title'))}</h1>
        <p style="margin:8px 0 0;font-size:13px;opacity:0.9;">${escapeHtml(data.cvFileName)} · ${escapeHtml(cvSourceLabel)}</p>
        <div style="display:flex;gap:24px;margin-top:20px;flex-wrap:wrap;">
          <div>
            <div style="font-size:11px;opacity:0.8;">${escapeHtml(profile.name)}</div>
            <div style="font-size:12px;opacity:0.75;margin-top:2px;">${escapeHtml(profile.program)}</div>
          </div>
          <div>
            <div style="font-size:11px;opacity:0.8;">${escapeHtml(t('student.internshipOffers.cvDashboard.hero.completion', { pct: profile.profileCompletion }))}</div>
            <div style="height:6px;width:140px;border-radius:999px;background:rgba(255,255,255,0.25);margin-top:6px;overflow:hidden;">
              <div style="height:100%;width:${profile.profileCompletion}%;background:#fff;border-radius:999px;"></div>
            </div>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;margin-bottom:24px;">
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:18px;text-align:center;">
          <div style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;">${escapeHtml(t('student.internshipOffers.cvDashboard.compare.current'))}</div>
          <div style="font-size:36px;font-weight:800;color:${SCORE_COLORS[overallTone]};margin-top:4px;">${meta.overallScore}</div>
        </div>
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:18px;text-align:center;">
          <div style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;">${escapeHtml(t('student.internshipOffers.cvDashboard.compare.potential'))}</div>
          <div style="font-size:36px;font-weight:800;color:${SCORE_COLORS[potentialTone]};margin-top:4px;">${meta.potentialScore}</div>
        </div>
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:18px;">
          <div style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;">${escapeHtml(t('student.internshipOffers.cvDashboard.score.title'))}</div>
          <div style="font-size:12px;color:#374151;margin-top:8px;">${escapeHtml(t('student.internshipOffers.cvDashboard.score.lastAnalyzed', { date: meta.lastAnalyzed }))}</div>
          <div style="font-size:11px;color:#6b7280;margin-top:4px;">${escapeHtml(t('student.internshipOffers.cvDashboard.score.version', { version: meta.analysisVersion }))}</div>
          ${meta.cvVersion ? `<div style="font-size:11px;color:#6b7280;margin-top:2px;">${escapeHtml(t('student.internshipOffers.cvDashboard.score.cvVersion', { version: meta.cvVersion }))}</div>` : ''}
        </div>
      </div>

      <h2 style="font-size:15px;font-weight:800;color:#111827;margin:0 0 12px;border-left:4px solid #4f46e5;padding-left:10px;">${escapeHtml(t('student.internshipOffers.cvDashboard.breakdown.title'))}</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:24px;">${breakdownHtml}</div>

      <h2 style="font-size:15px;font-weight:800;color:#111827;margin:0 0 12px;border-left:4px solid #4f46e5;padding-left:10px;">${escapeHtml(t('student.internshipOffers.cvDashboard.ai.title'))}</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:24px;">${insightsHtml}</div>

      <h2 style="font-size:15px;font-weight:800;color:#111827;margin:0 0 12px;border-left:4px solid #4f46e5;padding-left:10px;">${escapeHtml(t('student.internshipOffers.cvDashboard.skills.title'))}</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:14px 16px;">
          <div style="font-size:12px;font-weight:700;color:#047857;margin-bottom:8px;">${escapeHtml(t('student.internshipOffers.cvDashboard.skills.detected'))}</div>
          ${detectedSkillsHtml}
        </div>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:14px 16px;">
          <div style="font-size:12px;font-weight:700;color:#c2410c;margin-bottom:8px;">${escapeHtml(t('student.internshipOffers.cvDashboard.skills.missing'))}</div>
          ${missingSkillsHtml}
        </div>
      </div>

      <h2 style="font-size:15px;font-weight:800;color:#111827;margin:0 0 12px;border-left:4px solid #4f46e5;padding-left:10px;">${escapeHtml(t('student.internshipOffers.cvDashboard.compatibility.title'))}</h2>
      <p style="margin:0 0 12px;font-size:12px;color:#6b7280;">${escapeHtml(t('student.internshipOffers.cvDashboard.compatibility.subtitle'))}</p>
      <div style="margin-bottom:24px;">${matchesHtml}</div>

      <h2 style="font-size:15px;font-weight:800;color:#111827;margin:0 0 12px;border-left:4px solid #4f46e5;padding-left:10px;">${escapeHtml(t('student.internshipOffers.cvDashboard.recs.title'))}</h2>
      <div style="margin-bottom:24px;">${recsByPriority}</div>

      <h2 style="font-size:15px;font-weight:800;color:#111827;margin:0 0 12px;border-left:4px solid #4f46e5;padding-left:10px;">${escapeHtml(t('student.internshipOffers.cvDashboard.roadmap.title'))}</h2>
      <div style="margin-bottom:24px;">${roadmapHtml}</div>

      <h2 style="font-size:15px;font-weight:800;color:#111827;margin:0 0 12px;border-left:4px solid #4f46e5;padding-left:10px;">${escapeHtml(t('student.internshipOffers.cvDashboard.interview.title'))}</h2>
      <p style="margin:0 0 12px;font-size:12px;color:#6b7280;">${escapeHtml(t('student.internshipOffers.cvDashboard.interview.subtitle'))}</p>
      <div style="margin-bottom:24px;">${interviewHtml}</div>

      <div style="border-top:1px solid #e5e7eb;padding-top:14px;margin-top:8px;font-size:10px;color:#9ca3af;text-align:center;">
        Rapport généré le ${escapeHtml(generatedAt)} · Talent Center
        ${meta.reportUuid ? ` · Réf. ${escapeHtml(meta.reportUuid.slice(0, 8))}` : ''}
      </div>
    </div>
  `;
}

function buildFileName(data: CvAnalysisDashboardData): string {
  const safeName = data.profile.name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'etudiant';
  const date = new Date().toISOString().slice(0, 10);
  return `rapport-analyse-cv-${safeName}-${date}.pdf`;
}

export async function downloadCvAnalysisReport(
  data: CvAnalysisDashboardData,
  t: TFunction,
): Promise<void> {
  const container = document.createElement('div');
  container.innerHTML = buildReportHtml(data, t);
  container.style.cssText = 'position:fixed;left:-9999px;top:0;width:720px;padding:32px;background:#f3f4f6;';
  document.body.appendChild(container);

  const fileName = buildFileName(data);

  return new Promise((resolve, reject) => {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    pdf.html(container, {
      callback: (doc) => {
        document.body.removeChild(container);
        doc.save(fileName);
        resolve();
      },
      margin: [32, 32, 32, 32],
      width: 520,
      windowWidth: 720,
      autoPaging: 'text',
      html2canvas: { scale: 0.62, useCORS: true },
    }).catch((error: unknown) => {
      document.body.removeChild(container);
      reject(error);
    });
  });
}
