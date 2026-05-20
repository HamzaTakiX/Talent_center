import type { HistoryEventDto } from '../../api/history';
import type { HistoryActionRow, HistoryStatItem } from '../types';
import { HISTORY_STAT_CARD_DEFINITIONS } from '../constants/statCardDefinitions';

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
  VALIDATE: 'validate',
  APPROVE: 'validate',
  ARCHIVE: 'archive',
  REVIEW: 'review',
  ASSIGN: 'assign',
  SUBMIT: 'submit',
  PUBLISH: 'create',
  EXPORT: 'review',
  DELETE: 'archive',
  LOGIN: 'review',
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
    timestamp: ts,
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

export function buildStatsFromDashboard(
  moduleStats: { key: string; value: number }[] | undefined,
): HistoryStatItem[] {
  if (!moduleStats?.length) return [];
  const fmt = (n: number) => n.toLocaleString();
  const byKey = Object.fromEntries(moduleStats.map((s) => [s.key, s.value]));
  return HISTORY_STAT_CARD_DEFINITIONS.map((item) => ({
    ...item,
    value: fmt(byKey[item.key] ?? 0),
  })).filter((item) => {
    const raw = byKey[item.key];
    return raw !== undefined && raw > 0;
  });
}
