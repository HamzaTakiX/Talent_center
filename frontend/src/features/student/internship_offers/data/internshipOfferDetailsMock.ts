import type { InternshipOfferDetails } from '../types';

const digitalMarketingDetails: InternshipOfferDetails = {
  id: 'io1',
  title: 'Digital Marketing Intern',
  company: 'Maroc Telecom',
  location: 'Casablanca',
  tags: ['Marketing', 'Digital', 'Strategy'],
  matchPercent: 95,
  category: 'Marketing',
  description:
    'Join Maroc Telecom\'s marketing team to support digital campaigns, content creation, and performance analysis. You will work with cross-functional teams to strengthen brand visibility and engage customers across online channels.',
  responsibilities: [
    'Assist in planning and executing digital marketing campaigns',
    'Create content for social media and internal communications',
    'Monitor campaign performance and prepare weekly reports',
    'Collaborate with design and product teams on launch materials',
    'Support market research and competitor benchmarking activities',
  ],
  requiredProfile: [
    'Bachelor\'s student in Marketing, Business, or Communications',
    'Strong interest in digital media and brand strategy',
    'Fluent in French and Arabic; English is a plus',
    'Available for a 3–6 month internship',
    'Comfortable working in a fast-paced corporate environment',
  ],
  requiredSkills: [
    { label: 'Marketing', variant: 'primary' },
    { label: 'Digital', variant: 'primary' },
    { label: 'Strategy', variant: 'primary' },
    { label: 'Data Analysis', variant: 'neutral' },
    { label: 'Communication', variant: 'neutral' },
    { label: 'Teamwork', variant: 'neutral' },
    { label: 'MS Office', variant: 'neutral' },
  ],
  aiMatchSummary:
    'Your profile aligns strongly with this role. Your marketing coursework and project experience match the core requirements, with minor gaps in advanced analytics tools.',
  matchingSkills: [
    {
      label: 'Digital Marketing',
      description: 'Your coursework and campus projects demonstrate solid campaign planning skills.',
    },
    {
      label: 'Content Creation',
      description: 'Portfolio samples show experience with social media and branded content.',
    },
    {
      label: 'Strategic Thinking',
      description: 'Case study work reflects ability to connect tactics to business goals.',
    },
  ],
  relevantExperience: [
    'Marketing association project — led a 4-week social media campaign',
    'University brand challenge — top 3 finalist team',
    'Volunteer content role for a student-led startup',
  ],
  skillsToDevelop: [
    {
      label: 'Advanced Excel',
      description: 'Consider a short course on pivot tables and dashboards for reporting.',
    },
    {
      label: 'Google Analytics',
      description: 'Certification would strengthen your application for analytics tasks.',
    },
  ],
  aiRecommendations: [
    'Highlight your campaign metrics in your CV summary',
    'Prepare 2–3 examples of content you created for interviews',
    'Mention any experience with Meta or LinkedIn ad tools',
  ],
};

const businessDevelopmentDetails: InternshipOfferDetails = {
  id: 'io2',
  title: 'Business Development Intern',
  company: 'OCP Group',
  location: 'Casablanca',
  tags: ['Business Dev', 'Strategy', 'Sales'],
  matchPercent: 92,
  category: 'Business',
  description:
    'Support OCP Group\'s business development team in identifying growth opportunities, preparing client proposals, and analyzing market trends in the industrial sector.',
  responsibilities: [
    'Research potential partners and market segments',
    'Prepare presentation decks for internal review',
    'Track pipeline activity and update CRM records',
    'Assist senior managers during client meetings',
    'Compile weekly market intelligence summaries',
  ],
  requiredProfile: [
    'Student in Business, Economics, or Engineering',
    'Analytical mindset with interest in B2B sales',
    'Professional written and verbal communication',
    'Proficiency in Microsoft Office and presentation tools',
    'Motivated to learn corporate sales processes',
  ],
  requiredSkills: [
    { label: 'Business Dev', variant: 'primary' },
    { label: 'Strategy', variant: 'primary' },
    { label: 'Sales', variant: 'primary' },
    { label: 'Negotiation', variant: 'neutral' },
    { label: 'Research', variant: 'neutral' },
    { label: 'PowerPoint', variant: 'neutral' },
  ],
  aiMatchSummary:
    'You are a strong fit for this internship. Your business background and analytical projects align well with OCP\'s expectations for structured, data-driven work.',
  matchingSkills: [
    {
      label: 'Business Analysis',
      description: 'Your academic projects show structured problem-solving and market sizing.',
    },
    {
      label: 'Client Communication',
      description: 'Presentation experience supports stakeholder-facing tasks.',
    },
  ],
  relevantExperience: [
    'Business case competition — regional finalist',
    'Sales simulation lab — highest team score',
  ],
  skillsToDevelop: [
    {
      label: 'CRM Tools',
      description: 'Familiarize yourself with Salesforce basics before starting.',
    },
  ],
  aiRecommendations: [
    'Emphasize quantified results from group projects',
    'Prepare a concise elevator pitch about OCP\'s industry',
  ],
};

const brandManagementDetails: InternshipOfferDetails = {
  id: 'io3',
  title: 'Brand Management Intern',
  company: 'Coca-Cola Maroc',
  location: 'Casablanca',
  tags: ['Branding', 'Marketing', 'Strategy'],
  matchPercent: 88,
  category: 'Marketing',
  description:
    'Work with the brand team to support product positioning, consumer insights, and activation planning for one of Morocco\'s leading beverage portfolios.',
  responsibilities: [
    'Assist brand managers on seasonal campaigns',
    'Analyze consumer survey data and summarize insights',
    'Coordinate with agencies on creative deliverables',
    'Monitor competitor activations and share learnings',
    'Support in-store visibility and sampling events',
  ],
  requiredProfile: [
    'Marketing or business student with branding interest',
    'Creative and detail-oriented',
    'Comfortable with data and storytelling',
    'Team player with proactive attitude',
  ],
  requiredSkills: [
    { label: 'Branding', variant: 'primary' },
    { label: 'Marketing', variant: 'primary' },
    { label: 'Consumer Insights', variant: 'neutral' },
    { label: 'Excel', variant: 'neutral' },
  ],
  aiMatchSummary:
    'Your marketing foundation matches this role. Strengthening consumer research examples would make your profile even more competitive.',
  matchingSkills: [
    {
      label: 'Brand Strategy',
      description: 'Coursework covers positioning and brand architecture fundamentals.',
    },
  ],
  relevantExperience: ['Brand audit project for a local FMCG case study'],
  skillsToDevelop: [
    {
      label: 'SPSS / Survey Tools',
      description: 'Basic training in survey analysis would be valuable.',
    },
  ],
  aiRecommendations: ['Reference any event or activation experience in your cover letter'],
};

const financialAnalystDetails: InternshipOfferDetails = {
  id: 'io4',
  title: 'Financial Analyst Intern',
  company: 'Attijariwafa Bank',
  location: 'Casablanca',
  tags: ['Finance', 'Analysis', 'Banking'],
  matchPercent: 90,
  category: 'Finance',
  description:
    'Join the financial analysis team to support budgeting, forecasting, and reporting for retail banking products.',
  responsibilities: [
    'Prepare monthly variance reports',
    'Update financial models under supervision',
    'Gather data for regulatory and internal reports',
    'Support ad-hoc analysis for product managers',
  ],
  requiredProfile: [
    'Finance, accounting, or economics student',
    'Strong numeracy and Excel skills',
    'Attention to detail and confidentiality',
  ],
  requiredSkills: [
    { label: 'Finance', variant: 'primary' },
    { label: 'Analysis', variant: 'primary' },
    { label: 'Banking', variant: 'primary' },
    { label: 'Excel', variant: 'neutral' },
    { label: 'Financial Modeling', variant: 'neutral' },
  ],
  aiMatchSummary:
    'Your finance track record aligns with this role. Focus on demonstrating accuracy and model-building in your application.',
  matchingSkills: [
    {
      label: 'Financial Reporting',
      description: 'Accounting courses cover P&L and balance sheet analysis.',
    },
  ],
  relevantExperience: ['University finance club — budgeting workshop facilitator'],
  skillsToDevelop: [
    {
      label: 'VBA / Automation',
      description: 'Basic macros knowledge would differentiate your profile.',
    },
  ],
  aiRecommendations: ['Include any Excel model samples in your portfolio link'],
};

const hrManagementDetails: InternshipOfferDetails = {
  id: 'io5',
  title: 'HR Management Intern',
  company: 'BMCE Bank',
  location: 'Rabat',
  tags: ['HR', 'Recruitment', 'Training'],
  matchPercent: 85,
  category: 'HR',
  description:
    'Support HR operations including recruitment coordination, onboarding, and training program logistics.',
  responsibilities: [
    'Screen CVs and schedule interviews',
    'Maintain employee records and HR databases',
    'Assist training session logistics',
    'Prepare HR communications and templates',
  ],
  requiredProfile: [
    'HR, psychology, or management student',
    'Interpersonal skills and discretion',
    'Organized and reliable',
  ],
  requiredSkills: [
    { label: 'HR', variant: 'primary' },
    { label: 'Recruitment', variant: 'primary' },
    { label: 'Communication', variant: 'neutral' },
  ],
  aiMatchSummary:
    'You meet core HR internship criteria. Highlight any people-facing or coordination experience.',
  matchingSkills: [
    {
      label: 'Organization',
      description: 'Student leadership roles show coordination ability.',
    },
  ],
  relevantExperience: ['Orientation week volunteer — team coordinator'],
  skillsToDevelop: [
    {
      label: 'HRIS Systems',
      description: 'Explore basic HR software tutorials online.',
    },
  ],
  aiRecommendations: ['Mention languages spoken for recruitment support tasks'],
};

const consultingDetails: InternshipOfferDetails = {
  id: 'io6',
  title: 'Management Consulting Intern',
  company: 'Deloitte Morocco',
  location: 'Casablanca',
  tags: ['Consulting', 'Strategy', 'Management'],
  matchPercent: 93,
  category: 'Consulting',
  description:
    'Work alongside consultants on client engagements: research, slide preparation, workshop support, and implementation tracking.',
  responsibilities: [
    'Conduct industry and company research',
    'Build and refine PowerPoint deliverables',
    'Support workshop preparation and follow-ups',
    'Track project milestones and action items',
  ],
  requiredProfile: [
    'Top-performing business or engineering student',
    'Structured thinking and presentation skills',
    'Willingness to travel occasionally',
  ],
  requiredSkills: [
    { label: 'Consulting', variant: 'primary' },
    { label: 'Strategy', variant: 'primary' },
    { label: 'Management', variant: 'primary' },
    { label: 'PowerPoint', variant: 'neutral' },
    { label: 'Problem Solving', variant: 'neutral' },
  ],
  aiMatchSummary:
    'Excellent alignment with consulting internship requirements. Your case competition and analytical work stand out.',
  matchingSkills: [
    {
      label: 'Case Analysis',
      description: 'Multiple case competitions demonstrate structured frameworks.',
    },
    {
      label: 'Presentation',
      description: 'Strong slide design and storytelling in academic projects.',
    },
  ],
  relevantExperience: [
    'Consulting club — internal case challenge winner',
    'Strategy project for a local SME',
  ],
  skillsToDevelop: [
    {
      label: 'Advanced PowerPoint',
      description: 'Practice executive-ready deck formatting and chart standards.',
    },
  ],
  aiRecommendations: [
    'Prepare STAR-format stories for behavioral interviews',
    'Review Deloitte\'s recent publications in your target industry',
  ],
};

export const internshipOfferDetailsById: Record<string, InternshipOfferDetails> = {
  io1: digitalMarketingDetails,
  io2: businessDevelopmentDetails,
  io3: brandManagementDetails,
  io4: financialAnalystDetails,
  io5: hrManagementDetails,
  io6: consultingDetails,
};

export const allInternshipOfferDetails: InternshipOfferDetails[] = Object.values(
  internshipOfferDetailsById
);
