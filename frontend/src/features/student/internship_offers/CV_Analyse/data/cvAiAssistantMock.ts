import type { CvAiAssistantAnalysisMessage, CvAiAssistantCvSummary } from '../types/cvAiAssistant';

export const CV_AI_ASSISTANT_CV_SUMMARY: CvAiAssistantCvSummary = {
  fileName: 'Sarah_Alami_CV_2026.pdf',
  updatedLabel: 'March 15, 2026',
};

export const CV_AI_ASSISTANT_CONTEXT_LABEL = 'Business School CV';

export const CV_AI_ASSISTANT_SCORE_PERCENT = 82;

export const CV_AI_ASSISTANT_MESSAGE: CvAiAssistantAnalysisMessage = {
  intro: "I've analyzed your CV. Your CV score is",
  scorePercent: 82,
  strengthsTitle: 'Your Key Strengths:',
  strengths: [
    'Strong academic background in management and finance',
    'Relevant internship experience in consulting',
    'Clear structure and professional formatting',
    'Multilingual skills (French, English, Arabic)',
  ],
  improvementsTitle: 'Areas to Improve:',
  improvements: [
    'Add more quantifiable achievements',
    'Include leadership experience in student organizations',
    'Expand skills section with relevant certifications',
  ],
  closing: 'How can I help you improve your CV?',
};

export const CV_AI_ASSISTANT_SUGGESTED_QUESTIONS = [
  'How can I improve my CV score?',
  'Why is my score this percentage?',
  'What specific skills should I add?',
];

export const CV_AI_ASSISTANT_INPUT_PLACEHOLDER =
  'Ask about your CV, request specific advice, or discuss improvements...';
