/** Local (in-module) history pages — scoped to one operational domain via backend `kpi` / `module`. */
export interface ModuleLocalHistoryConfig {
  /** Backend `KPI_SOURCE_APPS` key (`queries.py`). */
  kpiKey: string;
  /** i18n: `admin.localHistory.<id>.title` */
  id: string;
  /** `data-admin-search-id` suffix */
  searchId: string;
  /** Hide module KPI cards — timeline-first audit layout. */
  hideAuditCards?: boolean;
  /** Compact activity summary bar (total, last activity, actions today). */
  showActivitySummary?: boolean;
}

export const MODULE_LOCAL_HISTORY: Record<string, ModuleLocalHistoryConfig> = {
  srf: {
    kpiKey: 'srf',
    id: 'srf',
    searchId: 'srf-history',
    hideAuditCards: true,
    showActivitySummary: true,
  },
  documents: {
    kpiKey: 'documents',
    id: 'documents',
    searchId: 'documents-history',
    hideAuditCards: true,
    showActivitySummary: true,
  },
  announcements: {
    kpiKey: 'announcements',
    id: 'announcements',
    searchId: 'announcements-history',
    hideAuditCards: true,
    showActivitySummary: true,
  },
  internshipOffers: {
    kpiKey: 'internship_offers',
    id: 'internshipOffers',
    searchId: 'internship-offers-history',
    hideAuditCards: true,
    showActivitySummary: true,
  },
  smartAssignment: {
    kpiKey: 'applications',
    id: 'smartAssignment',
    searchId: 'smart-assignment-history',
    hideAuditCards: true,
    showActivitySummary: true,
  },
  encadrants: {
    kpiKey: 'encadrants',
    id: 'encadrants',
    searchId: 'encadrants-history',
    hideAuditCards: true,
    showActivitySummary: true,
  },
  meetings: {
    kpiKey: 'meetings',
    id: 'meetings',
    searchId: 'meetings-history',
    hideAuditCards: true,
    showActivitySummary: true,
  },
};

export function getModuleLocalHistoryConfig(id: string): ModuleLocalHistoryConfig {
  const cfg = MODULE_LOCAL_HISTORY[id];
  if (!cfg) {
    throw new Error(`Unknown module local history: ${id}`);
  }
  return cfg;
}
