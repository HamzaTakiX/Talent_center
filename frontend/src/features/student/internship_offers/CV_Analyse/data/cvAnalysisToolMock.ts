import type { CvAnalysisToolCvFile, CvAnalysisToolStudentProfile } from '../types';

export const CV_ANALYSIS_TOOL_STUDENT_PROFILE: CvAnalysisToolStudentProfile = {
  name: 'Sarah Alami',
  role: 'Master in Management',
  avatarInitials: 'SA',
  notificationCount: 5,
};

export const CV_ANALYSIS_TOOL_CV_FILE: CvAnalysisToolCvFile = {
  fileName: 'Sarah_Alami_CV_2026.pdf',
  lastUpdated: 'March 15, 2026',
  sizeLabel: '2.4 MB',
  pageCount: 2,
};

export const CV_ANALYSIS_TOOL_READY_COPY = {
  title: 'Ready to Analyze Your CV',
  description:
    'Upload your CV and optionally select an internship offer to get personalized AI-powered analysis and recommendations.',
  proTipTitle: 'Pro Tip',
  proTipText:
    'Select an internship offer to get a compatibility score and specific recommendations for that position.',
};
