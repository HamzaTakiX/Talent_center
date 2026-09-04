export type EmailSystemTab =
  | 'general'
  | 'provider'
  | 'senders'
  | 'template'
  | 'analytics'
  | 'queue'
  | 'advanced';

export type ProviderStatus = 'connected' | 'disconnected' | 'connection_error';
export type EmailProviderType = 'mock' | 'sendgrid' | 'brevo' | 'ses' | 'mailgun' | 'smtp';

export interface GeneralSettings {
  platform_email_enabled: boolean;
  default_sender_name: string;
  default_sender_email: string;
  reply_to_email: string;
  default_language: 'fr' | 'en';
}

export interface ProviderConfig {
  provider: EmailProviderType;
  api_key?: string;
  api_key_masked: string;
  has_api_key: boolean;
  domain: string;
  region: string;
  endpoint: string;
  smtp_host: string;
  smtp_port: number | null;
  smtp_user: string;
  smtp_password?: string;
  smtp_use_tls: boolean;
  status: ProviderStatus;
  is_active: boolean;
  last_validated_at: string | null;
  last_error: string;
}

export interface SenderIdentity {
  id: number;
  display_name: string;
  email_address: string;
  module: string;
  status: string;
  is_default: boolean;
  is_verified: boolean;
}

export interface CategoryConfig {
  id: number;
  category: string;
  label: string;
  email_enabled: boolean;
  in_app_enabled: boolean;
  digest_enabled: boolean;
}

export interface TemplateVariable {
  key: string;
  label: string;
  description: string;
  sample: string;
  required: boolean;
}

export interface EmailTemplateRow {
  id: number;
  code: string;
  name: string;
  event_code: string;
  channel: string;
  category: string;
  version: number;
  is_active: boolean;
  is_selected: boolean;
  is_default: boolean;
  status: 'active' | 'archived' | string;
  languages: string[];
}

export interface TemplateTranslation {
  language: string;
  subject_template: string;
  body_html_template: string;
  body_text_template: string;
}

export interface EmailTemplateDetail extends EmailTemplateRow {
  translations: TemplateTranslation[];
  available_variables?: TemplateVariable[];
}

export interface EmailEventCatalogItem {
  event_code: string;
  category: string;
  priority: string;
  template_code: string;
  channels: string[];
  email_kind: string;
  variables: TemplateVariable[];
}

export interface AdvancedSettings {
  rate_limit_email_per_hour: number;
  rate_limit_global_per_minute: number;
  max_retry_attempts: number;
  queue_max_size: number;
  digest_schedule: string;
  bounce_handling_enabled: boolean;
  unsubscribe_rules_json: Record<string, unknown>;
}

export interface AnalyticsOverview {
  period_days: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  failed: number;
  queued: number;
  total_attempts: number;
  delivery_success_rate: number;
  templates: { template_code: string; count: number }[];
}

export interface QueueItem {
  id: number;
  user_email: string;
  event_code: string;
  delivery_channel: string;
  status: string;
  template_code: string;
  attempts: number;
  last_error: string;
  created_at: string;
}

export interface AuditEntry {
  id: number;
  changed_by_email: string;
  changed_at: string;
  change_type: string;
  field_name: string;
  old_value: string;
  new_value: string;
}
