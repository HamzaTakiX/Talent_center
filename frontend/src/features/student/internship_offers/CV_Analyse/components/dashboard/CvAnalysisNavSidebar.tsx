import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Brain,
  Clock,
  FileUp,
  Lightbulb,
  MessageSquare,
  Sparkles,
  Target,
  Wrench,
} from 'lucide-react';
import type { CvAnalysisNavSection } from '../../types/cvAnalysisDashboard';

const NAV_ITEMS: { id: CvAnalysisNavSection; icon: typeof Sparkles; labelKey: string }[] = [
  { id: 'upload', icon: FileUp, labelKey: 'student.internshipOffers.cvDashboard.nav.upload' },
  { id: 'analysis', icon: Sparkles, labelKey: 'student.internshipOffers.cvDashboard.nav.analysis' },
  { id: 'compatibility', icon: Target, labelKey: 'student.internshipOffers.cvDashboard.nav.compatibility' },
  { id: 'recommendations', icon: Lightbulb, labelKey: 'student.internshipOffers.cvDashboard.nav.recommendations' },
  { id: 'skills', icon: Wrench, labelKey: 'student.internshipOffers.cvDashboard.nav.skills' },
  { id: 'ai-suggestions', icon: Brain, labelKey: 'student.internshipOffers.cvDashboard.nav.aiSuggestions' },
  { id: 'interview', icon: MessageSquare, labelKey: 'student.internshipOffers.cvDashboard.nav.interview' },
  { id: 'history', icon: Clock, labelKey: 'student.internshipOffers.cvDashboard.nav.history' },
];

interface CvAnalysisNavSidebarProps {
  activeSection: CvAnalysisNavSection;
  onNavigate: (section: CvAnalysisNavSection) => void;
}

const CvAnalysisNavSidebar: FunctionComponent<CvAnalysisNavSidebarProps> = ({
  activeSection,
  onNavigate,
}) => {
  const { t } = useTranslation();

  return (
    <nav className="sr-cva-glass sr-cva-nav sr-cva__left" aria-label={t('student.internshipOffers.cvDashboard.nav.aria')}>
      <div className="sr-cva__nav-scroll">
        {NAV_ITEMS.map(({ id, icon: Icon, labelKey }) => (
          <button
            key={id}
            type="button"
            className={`sr-cva__nav-item${activeSection === id ? ' sr-cva__nav-item--active' : ''}`}
            onClick={() => onNavigate(id)}
          >
            <Icon aria-hidden />
            {t(labelKey)}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default CvAnalysisNavSidebar;
