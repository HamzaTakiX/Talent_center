import type { TFunction } from 'i18next';
import { isFutureSchedule, type PublicationMode } from './scheduleUtils';

const FORM_PREFIX = 'admin.forms.createAnnouncement';

export type AnnouncementFormFieldKey =
  | 'title'
  | 'type'
  | 'audience'
  | 'priority'
  | 'visibility'
  | 'message'
  | 'eventDate'
  | 'expirationDate'
  | 'publishDate'
  | 'publishTime'
  | 'timezone';

export type AnnouncementFormErrors = Partial<Record<AnnouncementFormFieldKey, string>>;

export interface AnnouncementFormValues {
  title: string;
  type: string;
  audience: string;
  priority: string;
  visibility: string;
  message: string;
  eventDate: string;
  expirationDate: string;
  publicationMode?: PublicationMode;
  publishDate?: string;
  publishTime?: string;
  timezone?: string;
}

export interface AnnouncementValidationOptions {
  hasTargeting?: boolean;
  publishing?: boolean;
  skipPublicationSchedule?: boolean;
}

const FIELD_ORDER: AnnouncementFormFieldKey[] = [
  'title',
  'type',
  'audience',
  'priority',
  'visibility',
  'message',
  'eventDate',
  'expirationDate',
  'publishDate',
  'publishTime',
  'timezone',
];

const FIELD_ELEMENT_ID: Record<AnnouncementFormFieldKey, string> = {
  title: 'announcement-title',
  type: 'announcement-type',
  audience: 'target-audience',
  priority: 'priority',
  visibility: 'visibility',
  message: 'message-content',
  eventDate: 'event-date',
  expirationDate: 'expiration-date',
  publishDate: 'publish-date',
  publishTime: 'publish-time',
  timezone: 'publish-timezone',
};

const API_FIELD_MAP: Record<string, AnnouncementFormFieldKey> = {
  title: 'title',
  summary: 'title',
  announcementTypeCode: 'type',
  body: 'message',
  priority: 'priority',
  target_scope: 'visibility',
  publish_start_at: 'publishDate',
  publish_end_at: 'expirationDate',
  schedule_date: 'publishDate',
  schedule_time: 'publishTime',
  schedule_timezone: 'timezone',
};

function v(t: TFunction, key: string): string {
  return t(`${FORM_PREFIX}.validation.${key}`);
}

export function validateCreateAnnouncementForm(
  values: AnnouncementFormValues,
  t: TFunction,
  options: AnnouncementValidationOptions = {},
): AnnouncementFormErrors {
  const errors: AnnouncementFormErrors = {};
  const { hasTargeting = false, publishing = false, skipPublicationSchedule = false } = options;

  if (!values.title.trim()) {
    errors.title = v(t, 'requiredTitle');
  }
  if (!values.type) {
    errors.type = v(t, 'requiredType');
  }
  if (!hasTargeting && !values.audience) {
    errors.audience = v(t, 'requiredAudience');
  }
  if (!values.priority) {
    errors.priority = v(t, 'requiredPriority');
  }
  if (!values.visibility) {
    errors.visibility = v(t, 'requiredVisibility');
  }
  if (!values.message.trim()) {
    errors.message = v(t, 'requiredMessage');
  }
  if (!values.expirationDate) {
    errors.expirationDate = v(t, 'requiredExpirationDate');
  }

  if (publishing && !skipPublicationSchedule && values.publicationMode === 'schedule') {
    if (!values.publishDate) {
      errors.publishDate = v(t, 'requiredPublishDate');
    }
    if (!values.publishTime) {
      errors.publishTime = v(t, 'requiredPublishTime');
    }
    if (!values.timezone) {
      errors.timezone = v(t, 'requiredTimezone');
    }
    if (
      values.publishDate &&
      values.publishTime &&
      values.timezone &&
      !isFutureSchedule(values.publishDate, values.publishTime, values.timezone)
    ) {
      errors.publishDate = v(t, 'publishDateFuture');
    }
  }

  return errors;
}

function firstApiMessage(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && value.length > 0) {
    return String(value[0]);
  }
  return null;
}

export function mapApiErrorsToForm(
  apiErrors: Record<string, unknown>,
  t: TFunction,
): AnnouncementFormErrors {
  const errors: AnnouncementFormErrors = {};

  for (const [apiKey, raw] of Object.entries(apiErrors)) {
    const field = API_FIELD_MAP[apiKey];
    if (!field) continue;
    const message = firstApiMessage(raw);
    if (!message) continue;
    errors[field] = message;
  }

  if (Object.keys(errors).length === 0 && apiErrors.non_field_errors) {
    errors.title = firstApiMessage(apiErrors.non_field_errors) ?? v(t, 'generic');
  }

  return errors;
}

export function scrollToFirstAnnouncementFieldError(errors: AnnouncementFormErrors): void {
  const first = FIELD_ORDER.find((key) => errors[key]);
  if (!first) return;

  const el = document.getElementById(FIELD_ELEMENT_ID[first]);
  if (!el) return;

  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLButtonElement) {
    el.focus({ preventScroll: true });
  }
}

export function countAnnouncementFormErrors(errors: AnnouncementFormErrors): number {
  return FIELD_ORDER.filter((key) => Boolean(errors[key])).length;
}
