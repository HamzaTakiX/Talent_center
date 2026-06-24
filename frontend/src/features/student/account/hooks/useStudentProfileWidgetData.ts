import { useMemo } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import type { StudentProfile } from '../../../auth/types';
import { computeStudentProfileCompletionPercent } from '../../internship_offers/CV_Analyse/utils/cvDraftReader';

export interface ProfileWidgetChecklistItem {
  key: string;
  done: boolean;
}

export interface StudentProfileWidgetData {
  profilePercent: number;
  profileChecklist: ProfileWidgetChecklistItem[];
  profileMissingCount: number;
  onboardingPercent: number;
  onboardingChecklist: ProfileWidgetChecklistItem[];
  onboardingMissingCount: number;
  internshipTypeLabel: string;
  internshipDurationLabel: string;
  internshipCategoryLabel: string;
  internshipConfigured: boolean;
  preferencesPercent: number;
  preferencesChecklist: ProfileWidgetChecklistItem[];
  preferencesMissingCount: number;
}

function text(value: string | null | undefined): string {
  return value?.trim() ?? '';
}

function buildProfileChecklist(sp: StudentProfile | undefined): ProfileWidgetChecklistItem[] {
  return [
    { key: 'identity', done: Boolean(sp?.identity_confirmed) },
    { key: 'profile', done: Boolean(sp?.profile_completed) },
    { key: 'linkedin', done: Boolean(text(sp?.linkedin_url)) },
    { key: 'skills', done: Boolean(sp?.skills?.length) },
  ];
}

function buildOnboardingChecklist(sp: StudentProfile | undefined): ProfileWidgetChecklistItem[] {
  return [
    { key: 'identity', done: Boolean(sp?.identity_confirmed) },
    { key: 'profile', done: Boolean(sp?.profile_completed) },
    { key: 'summary', done: Boolean(text(sp?.professional_summary)) },
  ];
}

function buildPreferencesChecklist(sp: StudentProfile | undefined): ProfileWidgetChecklistItem[] {
  return [
    { key: 'career', done: Boolean(text(sp?.career_objective)) },
    { key: 'availability', done: Boolean(text(sp?.availability)) },
    { key: 'location', done: Boolean(text(sp?.city)) },
    { key: 'mobility', done: Boolean(sp?.mobility?.length) },
  ];
}

function percentFromChecklist(items: ProfileWidgetChecklistItem[]): number {
  if (!items.length) return 0;
  const done = items.filter((item) => item.done).length;
  return Math.round((done / items.length) * 100);
}

function missingCount(items: ProfileWidgetChecklistItem[]): number {
  return items.filter((item) => !item.done).length;
}

export function useStudentProfileWidgetData(): StudentProfileWidgetData {
  const { user } = useAuth();
  const sp = user?.student_profile;

  return useMemo(() => {
    const profileChecklist = buildProfileChecklist(sp);
    const onboardingChecklist = buildOnboardingChecklist(sp);
    const preferencesChecklist = buildPreferencesChecklist(sp);

    const internshipTypeLabel = text(sp?.internship_type_name);
    const internshipDurationLabel = text(sp?.internship_duration);
    const internshipCategoryLabel = text(sp?.internship_category);

    return {
      profilePercent: computeStudentProfileCompletionPercent(user),
      profileChecklist,
      profileMissingCount: missingCount(profileChecklist),
      onboardingPercent: percentFromChecklist(onboardingChecklist),
      onboardingChecklist,
      onboardingMissingCount: missingCount(onboardingChecklist),
      internshipTypeLabel,
      internshipDurationLabel,
      internshipCategoryLabel,
      internshipConfigured: Boolean(internshipTypeLabel || internshipDurationLabel),
      preferencesPercent: percentFromChecklist(preferencesChecklist),
      preferencesChecklist,
      preferencesMissingCount: missingCount(preferencesChecklist),
    };
  }, [sp, user]);
}
