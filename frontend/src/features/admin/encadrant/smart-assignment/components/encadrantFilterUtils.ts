import type { TFunction } from 'i18next';
import type { SmartAssignmentEncadrantCard } from '../../../api/types';
import { specializationDomainLabel } from '../../utils/specializationDomainDisplay';

export type EncadrantCardsFilter = 'all' | 'available' | 'overloaded' | 'excluded';

export function encadrantFilterOptions(t: TFunction) {
  return [
    { value: 'all' as const, label: t('admin.smartAssignment.encadrants.filterAll') },
    { value: 'available' as const, label: t('admin.smartAssignment.encadrants.filterAvailable') },
    { value: 'overloaded' as const, label: t('admin.smartAssignment.encadrants.filterOverloaded') },
    { value: 'excluded' as const, label: t('admin.smartAssignment.encadrants.filterExcluded') },
  ];
}

export function filterEncadrantCards(
  encadrants: SmartAssignmentEncadrantCard[],
  options: {
    query: string;
    statusFilter: EncadrantCardsFilter;
    excludedIds: Set<number>;
    t: TFunction;
  }
): SmartAssignmentEncadrantCard[] {
  const { query, statusFilter, excludedIds, t } = options;
  const q = query.trim().toLowerCase();

  return encadrants.filter((enc) => {
    if (statusFilter === 'available') {
      if (!enc.is_available || enc.is_overloaded || excludedIds.has(enc.encadrant_profile_id)) {
        return false;
      }
    } else if (statusFilter === 'overloaded') {
      if (!enc.is_overloaded) return false;
    } else if (statusFilter === 'excluded') {
      if (!excludedIds.has(enc.encadrant_profile_id)) return false;
    }

    if (!q) return true;
    if (enc.full_name.toLowerCase().includes(q) || enc.email.toLowerCase().includes(q)) {
      return true;
    }
    return enc.specialization_domains.some((d) =>
      specializationDomainLabel(d, t).toLowerCase().includes(q)
    );
  });
}

export function sortEncadrantsByWorkload(
  encadrants: SmartAssignmentEncadrantCard[]
): SmartAssignmentEncadrantCard[] {
  return [...encadrants].sort((a, b) => {
    const loadA = a.max_capacity > 0 ? a.current_load / a.max_capacity : a.current_load;
    const loadB = b.max_capacity > 0 ? b.current_load / b.max_capacity : b.current_load;
    if (loadB !== loadA) return loadB - loadA;
    return b.current_load - a.current_load;
  });
}
