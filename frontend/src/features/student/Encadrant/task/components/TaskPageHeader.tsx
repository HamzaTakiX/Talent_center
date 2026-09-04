import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { ListTodo, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { easePremium } from '../../../../admin/dashboard/ui/animations';

const TaskPageHeader: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <motion.header
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: easePremium }}
      className="student-task-hero student-task-glass"
    >
      <span
        className="student-task-hero__glow -right-12 -top-12 h-40 w-40"
        style={{ background: 'var(--admin-brand-muted)' }}
        aria-hidden
      />
      <div className="relative flex min-w-0 items-start gap-3">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-muted)] text-[var(--admin-brand)]">
          <ListTodo className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div className="min-w-0">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--admin-border)] bg-[var(--admin-brand-muted)] px-3 py-1 text-xs font-semibold text-[var(--admin-brand)]">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            {t('student.encadrant.task.platform.badge')}
          </div>
          <h1 className="m-0 text-xl font-bold tracking-tight text-[var(--admin-text)] sm:text-2xl">
            {t('student.encadrant.task.platform.title')}
          </h1>
          <p className="m-0 mt-1 max-w-2xl text-sm leading-relaxed text-[var(--admin-text-secondary)]">
            {t('student.encadrant.task.platform.subtitle')}
          </p>
        </div>
      </div>
    </motion.header>
  );
};

export default TaskPageHeader;
