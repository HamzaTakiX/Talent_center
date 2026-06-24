import { jsPDF } from 'jspdf';
import { sanitizeReportText, splitReportParagraphs } from './summaryText';

export interface CareerCoachReportSection {
  categoryLabel: string;
  question: string;
  answerParagraphs: string[];
}

export interface CareerCoachReportExportInput {
  title: string;
  intro: string;
  sections: CareerCoachReportSection[];
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function reportFileStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildReportHtml({ title, intro, sections }: CareerCoachReportExportInput): string {
  const generatedAt = new Date().toLocaleString(undefined, {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  const sectionsHtml = sections
    .map((section, index) => {
      const answerHtml = section.answerParagraphs
        .map(
          (paragraph) =>
            `<p style="margin:0 0 8px;font-size:12px;line-height:1.55;color:#374151;">${escapeHtml(paragraph)}</p>`,
        )
        .join('');

      return `
        <section style="padding:16px 0;border-top:1px solid #e5e7eb;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:999px;background:#eef2ff;color:#4338ca;font-size:10px;font-weight:700;">${index + 1}</span>
            <span style="font-size:10px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#6b7280;">${escapeHtml(section.categoryLabel)}</span>
          </div>
          <h3 style="margin:0 0 10px;font-size:13px;font-weight:700;line-height:1.45;color:#111827;">${escapeHtml(section.question)}</h3>
          <div>${answerHtml}</div>
        </section>
      `;
    })
    .join('');

  return `
    <div style="font-family:Inter,Segoe UI,Arial,sans-serif;color:#111827;max-width:720px;">
      <header style="margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #e5e7eb;">
        <h1 style="margin:0 0 6px;font-size:20px;font-weight:800;letter-spacing:-0.02em;">${escapeHtml(title)}</h1>
        <p style="margin:0;font-size:12px;line-height:1.5;color:#6b7280;">${escapeHtml(intro)}</p>
      </header>
      <div>${sectionsHtml}</div>
      <footer style="margin-top:20px;padding-top:14px;border-top:1px solid #e5e7eb;font-size:10px;color:#9ca3af;text-align:center;">
        ${escapeHtml(generatedAt)} · Talent Center
      </footer>
    </div>
  `;
}

export function buildCareerCoachReportSections(
  highlights: Array<{ category: string; question: string; answer_preview: string }>,
  categoryLabel: (category: string) => string,
): CareerCoachReportSection[] {
  return highlights.map((item) => ({
    categoryLabel: categoryLabel(item.category),
    question: sanitizeReportText(item.question),
    answerParagraphs: splitReportParagraphs(item.answer_preview),
  }));
}

export function downloadCareerCoachReportWord(input: CareerCoachReportExportInput): void {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${escapeHtml(input.title)}</title></head><body>${buildReportHtml(input)}</body></html>`;
  const blob = new Blob([html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `career-coach-report-${reportFileStamp()}.doc`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function downloadCareerCoachReportPdf(
  input: CareerCoachReportExportInput,
): Promise<void> {
  const container = document.createElement('div');
  container.innerHTML = buildReportHtml(input);
  container.style.cssText = 'position:fixed;left:-9999px;top:0;width:720px;padding:32px;background:#ffffff;';
  document.body.appendChild(container);

  return new Promise((resolve, reject) => {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    pdf
      .html(container, {
        callback: (doc) => {
          document.body.removeChild(container);
          doc.save(`career-coach-report-${reportFileStamp()}.pdf`);
          resolve();
        },
        margin: [32, 32, 32, 32],
        width: 520,
        windowWidth: 720,
        autoPaging: 'text',
        html2canvas: { scale: 0.62, useCORS: true },
      })
      .catch((error: unknown) => {
        document.body.removeChild(container);
        reject(error);
      });
  });
}
