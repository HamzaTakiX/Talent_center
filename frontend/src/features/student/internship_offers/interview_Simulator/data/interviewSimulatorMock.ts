export const INTERVIEW_SIMULATOR_WELCOME_MESSAGE = {
  paragraphs: [
    'Welcome to the Interview Simulator!',
    'I will help you prepare for your internship interviews by simulating a real recruiter conversation.',
    'To get started, please provide some context. What would you like to do?',
  ],
};

export const INTERVIEW_SIMULATOR_ACTIONS = [
  { id: 'upload-cv', label: 'Upload CV', variant: 'upload' as const },
  { id: 'select-offer', label: 'Select Internship Offer', variant: 'offer' as const },
  { id: 'describe-company', label: 'Describe Company', variant: 'company' as const },
];
