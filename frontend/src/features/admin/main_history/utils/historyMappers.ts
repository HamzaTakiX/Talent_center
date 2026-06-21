import type { HistoryEventDto } from '../../api/history';
import type { HistoryActionRow, HistoryStatItem } from '../types';
import { GLOBAL_AUDIT_CARD_DEFINITIONS } from '../constants/auditCardDefinitions';
import {
  MODULE_AUDIT_CARD_DEFINITIONS,
  STUDENT_AUDIT_CARD_DEFINITIONS,
  type ModuleAuditKey,
} from '../constants/moduleAuditDefinitions';

const SOURCE_TO_MODULE: Record<string, HistoryActionRow['module']> = {
  stage: 'Internship Offers',
  internship: 'Internship Offers',
  documents: 'Documents',
  students: 'Students',
  auth: 'Students',
  announcements: 'Announcements',
  srf: 'SRF',
  encadrant: 'Encadrants',
  meetings: 'Encadrants',
  reports: 'Reports',
  chat: 'Chat',
  tasks: 'Reports',
  notifications: 'Chat',
  smart_assignment: 'Internship Offers',
  admins: 'Students',
  history: 'Documents',
};

const ACTION_MAP: Record<string, HistoryActionRow['actionType']> = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  VALIDATE: 'validate',
  APPROVE: 'validate',
  REJECT: 'reject',
  ARCHIVE: 'archive',
  REVIEW: 'review',
  ASSIGN: 'assign',
  SUBMIT: 'submit',
  PUBLISH: 'publish',
  EXPORT: 'review',
  IMPORT: 'import',
  LOGIN: 'login',
  LOGOUT: 'logout',
  SYSTEM: 'system_action',
};

export function mapEventToRow(event: HistoryEventDto): HistoryActionRow {
  const actionKey = (event.action_code || '').toUpperCase();
  const crit = event.criticality;
  let priority: HistoryActionRow['priority'] = 'low';
  let status: HistoryActionRow['status'] = 'success';
  if (crit === 'CRITICAL') {
    priority = 'high';
    status = 'warning';
  } else if (crit === 'IMPORTANT') {
    priority = 'medium';
    status = 'pending';
  } else if (crit === 'AUTOMATED') {
    priority = 'low';
    status = 'success';
  }

  const ts = event.occurred_at?.replace('T', ' ').slice(0, 19) ?? '';

  return {
    id: String(event.id),
    module: SOURCE_TO_MODULE[event.source_app] ?? 'Documents',
    actionType: ACTION_MAP[actionKey] ?? 'update',
    status,
    priority,
    title: event.summary,
    actor: event.is_automated ? 'System' : event.actor_name,
    actorRole: event.actor_role || undefined,
    timestamp: ts,
    occurredAt: event.occurred_at,
    criticality: crit,
    sourceApp: event.source_app,
    entityType: event.entity_type,
    entityId: event.entity_id,
    entityPath: event.entity_path ?? undefined,
    oldValues: event.old_values,
    newValues: event.new_values,
    isAutomated: event.is_automated,
    raw: event,
  };
}

export interface AuditStatDto {
  key: string;
  value: number;
  meta?: Record<string, unknown>;
}

export function buildGlobalAuditStats(
  auditStats: AuditStatDto[] | undefined,
): HistoryStatItem[] {
  if (!auditStats?.length) return [];
  const fmt = (n: number) => n.toLocaleString();
  const byKey = Object.fromEntries(auditStats.map((s) => [s.key, s]));

  return GLOBAL_AUDIT_CARD_DEFINITIONS.map((item) => {
    const raw = byKey[item.key];
    if (!raw) return null;
    let value = fmt(raw.value);
    if (item.key === 'most_active_module' && raw.meta?.label) {
      value = `${fmt(raw.value)}`;
    }
    return {
      ...item,
      value,
      meta: raw.meta,
    };
  }).filter(Boolean) as HistoryStatItem[];
}

export function buildModuleAuditStats(
  moduleKey: ModuleAuditKey,
  auditStats: AuditStatDto[] | undefined,
): HistoryStatItem[] {
  if (!auditStats?.length) return [];
  const defs = MODULE_AUDIT_CARD_DEFINITIONS[moduleKey] ?? [];
  const byKey = Object.fromEntries(auditStats.map((s) => [s.key, s]));
  const fmt = (n: number) => n.toLocaleString();

  return defs
    .map((item) => {
      const raw = byKey[item.key];
      if (!raw) return null;
      if (item.key === 'most_active_actor' && raw.meta?.actor_email) {
        return {
          ...item,
          value: fmt(raw.value),
          meta: raw.meta,
          label: String(raw.meta.actor_email),
        };
      }
      return { ...item, value: fmt(raw.value), meta: raw.meta };
    })
    .filter(Boolean) as HistoryStatItem[];
}

export function buildStudentAuditStats(
  auditStats: AuditStatDto[] | undefined,
): HistoryStatItem[] {
  if (!auditStats?.length) return [];
  const byKey = Object.fromEntries(auditStats.map((s) => [s.key, s]));
  const fmt = (n: number) => n.toLocaleString();
  return STUDENT_AUDIT_CARD_DEFINITIONS.map((item) => ({
    ...item,
    value: fmt(byKey[item.key]?.value ?? 0),
  }));
}

/** @deprecated Use buildGlobalAuditStats — kept for legacy card pages. */
export function buildStatsFromDashboard(
  moduleStats: { key: string; value: number }[] | undefined,
): HistoryStatItem[] {
  if (!moduleStats?.length) return [];
  return buildGlobalAuditStats(
    moduleStats.map((s) => ({ key: s.key, value: s.value })),
  );
}
