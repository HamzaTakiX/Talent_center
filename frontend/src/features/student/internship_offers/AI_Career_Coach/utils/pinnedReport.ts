import type {
  CoachChatHighlight,
  CoachChatSummary,
  CoachMessage,
  CoachMode,
  CoachSummaryCategory,
} from '../types/careerCoach';
import { sanitizeReportText } from './summaryText';

const MODE_CATEGORY: Record<CoachMode, CoachSummaryCategory> = {
  'career-coach': 'career',
  'cv-reviewer': 'cv',
  'ats-expert': 'cv',
  'interview-mentor': 'interview',
  'internship-advisor': 'internship',
};

function inferCategory(message: CoachMessage): CoachSummaryCategory | string {
  if (message.mode) return MODE_CATEGORY[message.mode] ?? 'career';
  return 'career';
}

function findPrecedingQuestion(messages: CoachMessage[], assistantIndex: number): string {
  for (let i = assistantIndex - 1; i >= 0; i -= 1) {
    const msg = messages[i];
    if (msg.role === 'user' && msg.text?.trim()) {
      return msg.text.trim();
    }
  }
  return '';
}

export function buildPinnedHighlights(
  messages: CoachMessage[],
  pinnedIds: string[],
): CoachChatHighlight[] {
  const idSet = new Set(pinnedIds);
  const highlights: CoachChatHighlight[] = [];

  messages.forEach((message, index) => {
    if (message.role !== 'assistant' || !idSet.has(message.id)) return;
    const answer = message.text?.trim();
    if (!answer) return;

    highlights.push({
      category: inferCategory(message),
      question: findPrecedingQuestion(messages, index) || '—',
      answer_preview: answer,
      created_at: new Date().toISOString(),
    });
  });

  return highlights;
}

export function buildPinnedSummary(
  sessionId: string,
  highlights: CoachChatHighlight[],
): CoachChatSummary | null {
  if (highlights.length === 0) return null;

  const keyTopics = [...new Set(highlights.map((item) => item.category))] as CoachSummaryCategory[];

  return {
    session_id: sessionId,
    overview: '',
    key_topics: keyTopics,
    highlights,
    total_messages: highlights.length,
    important_count: highlights.length,
    generated_at: new Date().toISOString(),
    has_important_content: true,
  };
}

export function formatSummaryAsPlainText(
  summary: CoachChatSummary,
  title: string,
  intro: string,
): string {
  const lines = [title, intro, ''];

  summary.highlights.forEach((item, index) => {
    lines.push(`${index + 1}. ${sanitizeReportText(item.question)}`);
    lines.push(sanitizeReportText(item.answer_preview));
    lines.push('');
  });

  return lines.join('\n').trim();
}
