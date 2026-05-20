import type { SupervisionDomainKey } from '../../api/types';

export const SUPERVISION_DOMAIN_OPTIONS: { value: SupervisionDomainKey; labelKey: string }[] = [
  { value: 'web_development', labelKey: 'webDevelopment' },
  { value: 'data_science', labelKey: 'dataScience' },
  { value: 'cybersecurity', labelKey: 'cybersecurity' },
  { value: 'ai', labelKey: 'ai' },
  { value: 'cloud', labelKey: 'cloud' },
  { value: 'networking', labelKey: 'networking' },
  { value: 'finance', labelKey: 'finance' },
  { value: 'marketing', labelKey: 'marketing' },
  { value: 'commerce', labelKey: 'commerce' },
  { value: 'hr', labelKey: 'hr' },
  { value: 'supply_chain', labelKey: 'supplyChain' },
];

export const ESCA_SSO_EMAIL_SUFFIX = '@groupe-esca.ma';
