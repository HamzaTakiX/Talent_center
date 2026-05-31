import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { STUDENT_CALLOUT_BRAND } from '../../../design-system/studentSemanticStyles';

export default function ReportAiAssistantCard() {
  const { t } = useTranslation();

  return (
    <section className={`box-border flex w-full min-w-0 flex-col gap-2 overflow-hidden rounded-[14px] p-4 font-inter ${STUDENT_CALLOUT_BRAND}`}>
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 shrink-0 text-[var(--admin-brand)]" aria-hidden />
        <h2 className="m-0 font-inter text-[15px] font-semibold leading-5 text-[var(--admin-text)]">
          {t('student.encadrant.reportEditor.aiAssistant')}
        </h2>
      </div>
      <p className="m-0 font-inter text-[13px] leading-5 text-[var(--admin-text-secondary)]">
        {t('student.encadrant.reportEditor.aiHint')}
      </p>
    </section>
  );
}
