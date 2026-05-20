import type { TFunction } from 'i18next';
import type { SpecializationDomainOption, SpecializationDomainRef } from '../../api/types';
import { SUPERVISION_DOMAIN_OPTIONS } from '../constants/supervisionDomains';

const FORM_PREFIX = 'admin.forms.createEncadrant';

export function isSpecializationDomainOption(
  d: SpecializationDomainRef,
): d is SpecializationDomainOption {
  return typeof d === 'object' && d !== null && 'name' in d;
}

/** @deprecated Legacy slug keys — prefer API `name` on SpecializationDomainOption */
function legacyDomainLabelKey(code: string): string {
  const opt = SUPERVISION_DOMAIN_OPTIONS.find((o) => o.value === code);
  return opt?.labelKey ?? code.replace(/_/g, ' ');
}

export function specializationDomainLabel(d: SpecializationDomainRef, t: TFunction): string {
  if (isSpecializationDomainOption(d)) {
    return d.name;
  }
  const labelKey = legacyDomainLabelKey(d);
  return t(`${FORM_PREFIX}.domains.${labelKey}`, { defaultValue: d });
}
