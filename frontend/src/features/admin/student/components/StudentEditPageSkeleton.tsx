import type { FunctionComponent, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { easePremium } from '../../dashboard/ui/animations';

/* ── Shared shimmer atom ───────────────────────────────────────────────── */

const Shimmer: FunctionComponent<{ className?: string }> = ({ className = '' }) => (
  <motion.div
    className={`admin-shimmer admin-section-shimmer ${className}`}
    aria-hidden
    initial={{ opacity: 0.5 }}
    animate={{ opacity: 0.95 }}
    transition={{ duration: 0.85, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
  />
);

/* ── Generic section wrapper (mirrors AdminFormSection DOM) ────────────── */

const FormSectionSkeleton: FunctionComponent<{ delay?: number; bodyContent: ReactNode }> = ({
  delay = 0,
  bodyContent,
}) => (
  <motion.div
    className="admin-form-section admin-module-panel overflow-hidden"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.32, ease: easePremium, delay }}
    aria-hidden
  >
    {/* Mirrors .admin-form-section__header */}
    <div className="admin-form-section__header">
      <Shimmer className="h-9 w-9 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-2">
        <Shimmer className="h-3.5 w-28" />
        <Shimmer className="h-3 w-52 max-w-full" />
      </div>
    </div>
    {/* Mirrors .admin-form-section__body */}
    <div className="admin-form-section__body p-5 sm:p-6">{bodyContent}</div>
  </motion.div>
);

/* ── Per-section body content ──────────────────────────────────────────── */

const PhotoBody: FunctionComponent = () => (
  <div className="admin-student-edit-photo">
    <div className="admin-student-edit-photo__visual">
      <Shimmer className="h-[6.25rem] w-[6.25rem] rounded-2xl" />
    </div>
    <div className="admin-student-edit-photo__content">
      <div className="admin-student-edit-photo__meta space-y-2">
        <Shimmer className="h-5 w-44" />
        <Shimmer className="h-3.5 w-60 max-w-full" />
        <Shimmer className="h-3 w-28" />
      </div>
      <div className="admin-student-edit-photo__actions">
        <Shimmer className="h-[2.375rem] w-36 rounded-admin-sm" />
        <Shimmer className="h-[2.375rem] w-32 rounded-admin-sm" />
      </div>
    </div>
  </div>
);

const PersonalBody: FunctionComponent = () => (
  <div className="admin-form__grid grid grid-cols-1 gap-6 md:grid-cols-2 sm:gap-x-8 sm:gap-y-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex flex-col gap-2">
        <Shimmer className="h-3.5 w-24" />
        <Shimmer className="h-10 w-full rounded-lg" />
      </div>
    ))}
  </div>
);

const AcademicBody: FunctionComponent = () => (
  <div className="admin-form__grid grid grid-cols-1 gap-6 md:grid-cols-2 sm:gap-x-8 sm:gap-y-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="flex flex-col gap-2">
        <Shimmer className="h-3.5 w-20" />
        <Shimmer className="h-10 w-full rounded-lg" />
      </div>
    ))}
  </div>
);

const AccessBody: FunctionComponent = () => (
  <div className="space-y-4">
    <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface-inset)] px-4 py-3"
        >
          <div className="space-y-1.5">
            <Shimmer className="h-3.5 w-28" />
            <Shimmer className="h-3 w-40 max-w-full" />
          </div>
          <Shimmer className="h-6 w-11 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
    <div className="mt-4 flex flex-col gap-2">
      <Shimmer className="h-3.5 w-28" />
      <Shimmer className="h-10 w-full rounded-lg" />
    </div>
  </div>
);

const CredentialsBody: FunctionComponent = () => (
  <div className="space-y-4">
    <div className="grid gap-3 sm:grid-cols-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className={`flex items-center gap-3 ${i === 2 ? 'sm:col-span-2' : ''}`}>
          <Shimmer className="h-3.5 w-32" />
          <Shimmer className="h-3.5 w-14" />
        </div>
      ))}
    </div>
    <div className="flex flex-wrap gap-2 pt-1">
      <Shimmer className="h-9 w-44 rounded-admin-sm" />
      <Shimmer className="h-9 w-40 rounded-admin-sm" />
    </div>
  </div>
);

/* ── Hero skeleton (no avatar — matches enhanced hero) ─────────────────── */

export const StudentEditHeroSkeleton: FunctionComponent = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3, ease: easePremium }}
    className="admin-student-edit-hero"
    role="status"
    aria-busy="true"
    aria-label="Chargement"
  >
    <div className="admin-student-edit-hero__mesh admin-student-edit-hero__mesh--primary" aria-hidden />
    <div className="admin-student-edit-hero__mesh admin-student-edit-hero__mesh--secondary" aria-hidden />
    <div className="admin-student-edit-hero__shine" aria-hidden />
    <span className="sr-only">Chargement des informations étudiant…</span>

    <div className="admin-student-edit-hero__inner">
      <div className="admin-student-edit-hero__copy min-w-0">
        <Shimmer className="mb-3 h-5 w-36 rounded-full" />
        <Shimmer className="h-8 w-64 max-w-[75%]" />
        <Shimmer className="mt-2.5 h-4 w-80 max-w-[85%]" />
        <div className="mt-4 flex flex-wrap gap-2">
          <Shimmer className="h-7 w-48 rounded-full" />
          <Shimmer className="h-7 w-28 rounded-full" />
          <Shimmer className="h-7 w-20 rounded-full" />
        </div>
      </div>
      <div className="admin-student-edit-hero__deco" aria-hidden />
    </div>
  </motion.div>
);

/* ── Full-page skeleton (all 5 form sections) ──────────────────────────── */

const StudentEditPageSkeleton: FunctionComponent = () => (
  <div
    role="status"
    aria-live="polite"
    aria-busy="true"
    aria-label="Chargement des informations étudiant"
    className="flex flex-col gap-5"
  >
    <span className="sr-only">Chargement des informations étudiant…</span>
    <FormSectionSkeleton delay={0}    bodyContent={<PhotoBody />} />
    <FormSectionSkeleton delay={0.07} bodyContent={<PersonalBody />} />
    <FormSectionSkeleton delay={0.13} bodyContent={<AcademicBody />} />
    <FormSectionSkeleton delay={0.19} bodyContent={<AccessBody />} />
    <FormSectionSkeleton delay={0.25} bodyContent={<CredentialsBody />} />
  </div>
);

export default StudentEditPageSkeleton;
