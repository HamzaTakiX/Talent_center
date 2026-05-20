import { FunctionComponent, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Archive, MessageSquare } from 'lucide-react';
import AdminModulePageShell from '../../../ui/AdminModulePageShell';
import AdminModulePageSkeleton from '../../../ui/AdminModulePageSkeleton';
import AdminSubpageHeader from '../../../ui/AdminSubpageHeader';
import { useSupervisionReportDetail } from '../hooks/useSupervisionReportDetail';
import { adminSupervisionReportsApi } from '../../../api/supervisionReports';
import SupervisionReportWorkflowTimeline from '../components/SupervisionReportWorkflowTimeline';
import { reportStatusTableBadge } from '../../../ui/adminStatusBadges';

const severityClass: Record<string, string> = {
  CRITICAL: 'bg-red-500/15 text-red-600 border-red-500/40',
  HIGH: 'bg-orange-500/15 text-orange-600 border-orange-500/40',
  MEDIUM: 'bg-amber-500/15 text-amber-700 border-amber-500/40',
  LOW: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
  INFO: 'bg-slate-500/10 text-slate-600 border-slate-500/30',
};

const SupervisionReportDetailPage: FunctionComponent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { report, loading, error, reload } = useSupervisionReportDetail(id);
  const [note, setNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const runAction = async (fn: () => Promise<unknown>) => {
    setActionLoading(true);
    try {
      await fn();
      await reload();
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminModulePageShell width="wide">
        <AdminModulePageSkeleton tableRows={8} />
      </AdminModulePageShell>
    );
  }

  if (error || !report) {
    return (
      <AdminModulePageShell width="wide">
        <p className="text-red-600">{error ?? 'Rapport introuvable'}</p>
        <Link to="/admin/encadrant/reports" className="admin-link mt-2 inline-block">
          {t('admin.back.encadrants', { defaultValue: 'Retour aux rapports' })}
        </Link>
      </AdminModulePageShell>
    );
  }

  return (
    <AdminModulePageShell width="wide">
    <div className="admin-subpage-stack">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-2 inline-flex items-center gap-1 text-sm text-[var(--admin-brand)]"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('admin.common.actions.back', { defaultValue: 'Retour' })}
      </button>

      <AdminSubpageHeader title={report.title} subtitle={`${report.reportTypeLabel} · ${report.student}`} />

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,35%)_1fr]">
        <aside className="space-y-4">
          <section className="admin-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-[var(--admin-text)]">
              {t('admin.modules.reports.detail.student', { defaultValue: 'Étudiant' })}
            </h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-[var(--admin-text-muted)]">Nom</dt>
                <dd>{report.studentSummary.displayName}</dd>
              </div>
              <div>
                <dt className="text-[var(--admin-text-muted)]">Email</dt>
                <dd>{report.studentSummary.email}</dd>
              </div>
              <div>
                <dt className="text-[var(--admin-text-muted)]">Filière</dt>
                <dd>{report.studentSummary.filiere ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-[var(--admin-text-muted)]">Classe</dt>
                <dd>{report.studentSummary.classGroup ?? '—'}</dd>
              </div>
            </dl>
          </section>

          <section className="admin-card p-4">
            <h3 className="mb-3 text-sm font-semibold">
              {t('admin.modules.reports.detail.internship', { defaultValue: 'Stage' })}
            </h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-[var(--admin-text-muted)]">Type</dt>
                <dd>{report.internshipType?.label ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-[var(--admin-text-muted)]">Entreprise</dt>
                <dd>{report.companyName}</dd>
              </div>
              <div>
                <dt className="text-[var(--admin-text-muted)]">Période</dt>
                <dd>
                  {report.internshipPeriodStart ?? '—'} → {report.internshipPeriodEnd ?? '—'}
                </dd>
              </div>
            </dl>
          </section>

          <section className="admin-card p-4">
            <h3 className="mb-2 text-sm font-semibold">Encadrant</h3>
            <p className="text-sm">{report.encadrantSummary.displayName}</p>
            <p className="text-xs text-[var(--admin-text-muted)]">{report.encadrantSummary.email}</p>
          </section>
        </aside>

        <main className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className={reportStatusTableBadge(report.presentationStatus)}>
              {report.presentationStatus}
            </span>
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${severityClass[report.severity] ?? severityClass.INFO}`}
            >
              {report.severity}
            </span>
            <span className="text-xs text-[var(--admin-text-muted)]">
              Priorité {report.priorityScore}
            </span>
          </div>

          <section className="admin-card p-4">
            <h3 className="mb-2 font-semibold">
              {t('admin.modules.reports.detail.content', { defaultValue: 'Contenu' })}
            </h3>
            <p className="whitespace-pre-wrap text-sm text-[var(--admin-text)]">{report.comments || '—'}</p>
            {report.score != null ? (
              <p className="mt-2 text-sm">
                <strong>Score:</strong> {report.score}
              </p>
            ) : null}
          </section>

          {report.attachments.length > 0 ? (
            <section className="admin-card p-4">
              <h3 className="mb-2 font-semibold">Pièces jointes</h3>
              <ul className="space-y-1 text-sm">
                {report.attachments.map((a) => (
                  <li key={a.id}>
                    {a.url ? (
                      <a href={a.url} target="_blank" rel="noreferrer" className="admin-link">
                        {a.originalName}
                      </a>
                    ) : (
                      a.originalName
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="admin-card p-4">
            <h3 className="mb-3 font-semibold">
              {t('admin.modules.reports.detail.actions', { defaultValue: 'Actions admin' })}
            </h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('admin.modules.reports.detail.notePlaceholder', {
                defaultValue: 'Note optionnelle…',
              })}
              className="admin-field mb-3 min-h-[72px] w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-input-bg)] p-2 text-sm"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => runAction(() => adminSupervisionReportsApi.approve(id!, note))}
                className="admin-btn admin-btn-primary inline-flex items-center gap-1"
              >
                <CheckCircle className="h-4 w-4" />
                Approuver
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => runAction(() => adminSupervisionReportsApi.reject(id!, note))}
                className="admin-btn admin-btn-secondary inline-flex items-center gap-1"
              >
                <XCircle className="h-4 w-4" />
                Rejeter
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => runAction(() => adminSupervisionReportsApi.requestChanges(id!, note))}
                className="admin-btn admin-btn-secondary inline-flex items-center gap-1"
              >
                <MessageSquare className="h-4 w-4" />
                Demander modifications
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => runAction(() => adminSupervisionReportsApi.escalate(id!, note))}
                className="admin-btn admin-btn-secondary inline-flex items-center gap-1"
              >
                <AlertTriangle className="h-4 w-4" />
                Escalader
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => runAction(() => adminSupervisionReportsApi.archive(id!, note))}
                className="admin-btn admin-btn-secondary inline-flex items-center gap-1"
              >
                <Archive className="h-4 w-4" />
                Archiver
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => {
                  void adminSupervisionReportsApi.exportPdf(id!).then((blob) => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `report-${id}.pdf`;
                    a.click();
                    URL.revokeObjectURL(url);
                  });
                }}
              >
                PDF
              </button>
            </div>
          </section>

          <SupervisionReportWorkflowTimeline events={report.timeline} />
          {report.adminNotes.length > 0 ? (
            <section className="admin-card p-4">
              <h3 className="mb-2 font-semibold">Notes internes</h3>
              <ul className="space-y-2 text-sm">
                {report.adminNotes.map((n) => (
                  <li key={n.id} className="border-l-2 border-[var(--admin-brand)] pl-3">
                    <p>{n.body}</p>
                    <p className="text-xs text-[var(--admin-text-muted)]">
                      {n.author} · {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </main>
      </div>
    </div>
    </AdminModulePageShell>
  );
};

export default SupervisionReportDetailPage;
