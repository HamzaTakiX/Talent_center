/** Local (in-module) history pages — scoped to one operational domain via backend `kpi` / `module`. */
export interface ModuleLocalHistoryConfig {
  /** Backend `KPI_SOURCE_APPS` key (`queries.py`). */
  kpiKey: string;
  /** i18n: `admin.localHistory.<id>.title` */
  id: string;
  /** `data-admin-search-id` suffix */
  searchId: string;
}

export const MODULE_LOCAL_HISTORY: Record<string, ModuleLocalHistoryConfig> = {
  srf: { kpiKey: 'srf', id: 'srf', searchId: 'srf-history' },
  documents: { kpiKey: 'documents', id: 'documents', searchId: 'documents-history' },
  announcements: { kpiKey: 'announcements', id: 'announcements', searchId: 'announcements-history' },
  internshipOffers: {
    kpiKey: 'internship_offers',
    id: 'internshipOffers',
    searchId: 'internship-offers-history',
  },
  smartAssignment: {
    kpiKey: 'applications',
    id: 'smartAssignment',
    searchId: 'smart-assignment-history',
  },
  encadrants: { kpiKey: 'encadrants', id: 'encadrants', searchId: 'encadrants-history' },
  meetings: { kpiKey: 'meetings', id: 'meetings', searchId: 'meetings-history' },
};

export function getModuleLocalHistoryConfig(id: string): ModuleLocalHistoryConfig {
  const cfg = MODULE_LOCAL_HISTORY[id];
  if (!cfg) {
    throw new Error(`Unknown module local history: ${id}`);
  }
  return cfg;
}
