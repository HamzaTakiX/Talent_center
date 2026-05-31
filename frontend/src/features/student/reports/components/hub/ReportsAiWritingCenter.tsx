import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Languages,
  Sparkles,
  SpellCheck,
  Wand2,
  Zap,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { studentReportEditorPath } from '../../constants/routes';
import ReportsWorkspaceModuleHeader from './ReportsWorkspaceModuleHeader';

interface ReportsAiWritingCenterProps {
  reportId: string;
  variant?: 'hero' | 'compact';
}

const AI_ACTIONS = [
  { id: 'improve', icon: Wand2, labelKey: 'improveWriting', descKey: 'improveWritingDesc' },
  { id: 'rewrite', icon: Languages, labelKey: 'rewriteAcademic', descKey: 'rewriteAcademicDesc' },
  { id: 'grammar', icon: SpellCheck, labelKey: 'grammarCheck', descKey: 'grammarCheckDesc' },
  { id: 'abstract', icon: BookOpen, labelKey: 'generateAbstract', descKey: 'generateAbstractDesc' },
] as const;

const ReportsAiWritingCenter: FunctionComponent<ReportsAiWritingCenterProps> = ({
  reportId,
  variant = 'hero',
}) => {
  const { t } = useTranslation();
  const isHero = variant === 'hero';

  return (
    <section className={`sr-hub-card sr-hub-ai-hero ${isHero ? 'sr-hub-ai-hero--prominent' : ''}`}>
      <div className="sr-hub-ai-hero__glow" aria-hidden />
      <div className="sr-hub-ai-hero__inner">
        <ReportsWorkspaceModuleHeader
          icon={<Sparkles className="h-5 w-5" />}
          title={t('student.reports.hub.aiTitle')}
          subtitle={t('student.reports.hub.aiHeroSubtitle')}
          badge={<span className="sr-hub-ai-hero__badge">{t('student.reports.hub.aiBadge')}</span>}
        />

        {isHero && (
          <p className="sr-hub-ai-hero__pitch">{t('student.reports.hub.aiHeroPitch')}</p>
        )}

        <div className={`sr-hub-ai-hero__actions ${isHero ? 'sr-hub-ai-hero__actions--hero' : ''}`}>
          {AI_ACTIONS.map((action, i) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              whileHover={{ y: -2 }}
            >
              <Link to={studentReportEditorPath(reportId)} className="sr-hub-ai-hero__action">
                <span className="sr-hub-ai-hero__action-icon">
                  <action.icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="sr-hub-ai-hero__action-text">
                  <span className="sr-hub-ai-hero__action-label">
                    {t(`student.reports.ai.${action.labelKey}`)}
                  </span>
                  {isHero && (
                    <span className="sr-hub-ai-hero__action-desc">
                      {t(`student.reports.hub.aiActions.${action.descKey}`)}
                    </span>
                  )}
                </span>
                <ArrowRight className="sr-hub-ai-hero__action-arrow h-4 w-4 shrink-0" aria-hidden />
              </Link>
            </motion.div>
          ))}
        </div>

        <Link to={studentReportEditorPath(reportId)} className="sr-hub-ai-hero__cta">
          <Zap className="h-4 w-4" aria-hidden />
          {t('student.reports.hub.openAiAssistant')}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
};

export default ReportsAiWritingCenter;
