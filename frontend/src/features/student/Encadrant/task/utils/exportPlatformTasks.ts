import type { StudentPlatformTask } from '../types';

function csvCell(value: string | number): string {
  const text = String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function exportPlatformTasksCsv(
  tasks: StudentPlatformTask[],
  translate: (key: string) => string,
): void {
  const headers = [
    translate('student.encadrant.task.platform.export.colTitle'),
    translate('student.encadrant.task.platform.export.colStatus'),
    translate('student.encadrant.task.platform.export.colPriority'),
    translate('student.encadrant.task.platform.export.colCategory'),
    translate('student.encadrant.task.platform.export.colDue'),
    translate('student.encadrant.task.platform.export.colProgress'),
    translate('student.encadrant.task.platform.export.colSupervisor'),
  ];

  const rows = tasks.map((task) => [
    translate(task.titleKey),
    translate(`student.encadrant.task.platform.status.${task.status}`),
    translate(`student.encadrant.task.platform.priorities.${task.priority}`),
    translate(`student.encadrant.task.platform.categories.${task.category}`),
    task.dueAt,
    `${task.progress}%`,
    translate(task.supervisorKey),
  ]);

  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `tasks-${stamp}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
