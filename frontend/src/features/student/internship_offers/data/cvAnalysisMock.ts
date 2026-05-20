import type { CvAnalysisResult } from '../types/cvAnalysis';

const digitalMarketingAnalysis: CvAnalysisResult = {
  offerId: 'io1',
  matchScore: 82,
  strengths: {
    matchingSkills: {
      title: 'Matching Skills',
      items: [
        { label: 'Digital Marketing', description: 'Strong alignment with campaign and content requirements.' },
        { label: 'Social Media', description: 'Hands-on experience from university projects.' },
        { label: 'Content Strategy', description: 'Demonstrated in brand challenge work.' },
      ],
    },
    relevantExperience: {
      title: 'Relevant Experience',
      items: [
        { label: 'Marketing association — 4-week social media campaign lead' },
        { label: 'University brand challenge — top 3 finalist' },
        { label: 'Volunteer content role for student startup' },
      ],
    },
  },
  weaknesses: {
    missingSkills: {
      title: 'Missing Skills',
      items: [
        { label: 'Google Analytics', description: 'Not prominently featured on your CV.' },
        { label: 'Paid Ads (Meta/LinkedIn)', description: 'Limited mention of platform experience.' },
        { label: 'Advanced Excel', description: 'Reporting tools could be strengthened.' },
      ],
    },
    weakSections: {
      title: 'Weak Sections',
      items: [
        { label: 'Metrics & Results', description: 'Add quantified outcomes to campaign bullets.' },
        { label: 'Tools Section', description: 'List marketing and analytics tools explicitly.' },
      ],
    },
  },
  improvements: {
    actionableSuggestions: {
      title: 'Actionable Suggestions',
      items: [
        { label: 'Add KPIs', description: 'Include reach, engagement, or conversion metrics per project.' },
        { label: 'Certifications', description: 'Highlight Google Analytics or Meta Blueprint if available.' },
        { label: 'Portfolio link', description: 'Add a link to content samples or case studies.' },
      ],
    },
    quickWins: {
      title: 'Quick Wins',
      items: [
        { label: 'Rewrite summary', description: 'Lead with digital marketing specialization.' },
        { label: 'Reorder skills', description: 'Place Marketing, Digital, Strategy at the top.' },
      ],
    },
  },
  overallAssessment:
    'Your CV shows a solid foundation for this Digital Marketing internship at Maroc Telecom. With targeted updates to analytics tools and measurable results, you can significantly strengthen your application and interview readiness.',
  interviewProbability: 75,
  potentialScore: 92,
};

function buildAnalysisFromOffer(
  offerId: string,
  matchScore: number,
  base: Omit<CvAnalysisResult, 'offerId' | 'matchScore'>
): CvAnalysisResult {
  return { offerId, matchScore, ...base };
}

const defaultAnalysisTemplate = (
  offerId: string,
  matchScore: number
): CvAnalysisResult =>
  buildAnalysisFromOffer(offerId, matchScore, {
    strengths: digitalMarketingAnalysis.strengths,
    weaknesses: digitalMarketingAnalysis.weaknesses,
    improvements: digitalMarketingAnalysis.improvements,
    overallAssessment: digitalMarketingAnalysis.overallAssessment,
    interviewProbability: digitalMarketingAnalysis.interviewProbability,
    potentialScore: digitalMarketingAnalysis.potentialScore,
  });

export const cvAnalysisByOfferId: Record<string, CvAnalysisResult> = {
  io1: digitalMarketingAnalysis,
  io2: defaultAnalysisTemplate('io2', 78),
  io3: defaultAnalysisTemplate('io3', 80),
  io4: defaultAnalysisTemplate('io4', 76),
  io5: defaultAnalysisTemplate('io5', 74),
  io6: defaultAnalysisTemplate('io6', 85),
};
