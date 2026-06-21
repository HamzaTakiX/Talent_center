import { FunctionComponent, useEffect, useState } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye, Check, X, Mail } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { stageApi } from '../../../shared/api/stageApi';
import { mapStageDetailToAdminDetail } from '../../../shared/utils/stageMappers';
import { useStageOfferDetail } from '../hooks/useStageOffers';
import { InternshipOfferDetail, OfferApplicantRow } from '../types';
import { AdminTableEmptyState } from '../../ui';
import AdminBackButton from '../../ui/AdminBackButton';
import { adminTableBtn } from '../../ui/adminTableButtons';
import { useAdminBackLabel, useAdminCopy } from '../../i18n/useAdminCopy';
import { useAdminTableValues } from '../../i18n/useAdminTableValues';
import OffersListLoading from '../components/OffersListLoading';
import { useOffersListLabels } from '../hooks/useOffersListLabels';

const LEGACY_PREFIX = 'admin.modules.offers.legacyView';

const statusHeaderClass: Record<string, string> = {
  Active: 'admin-badge admin-badge--success',
  Draft: 'admin-badge admin-badge--warning',
  Expired: 'admin-badge admin-badge--danger',
  Closed: 'admin-badge admin-badge--neutral',
};

const statusRowClass: Record<OfferApplicantRow['status'], string> = {
  Pending: 'admin-badge admin-badge--warning',
  Accepted: 'admin-badge admin-badge--success',
};

const ViewInternshipOfferPage: FunctionComponent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: offerData, loading, error } = useStageOfferDetail(id);
  const [detail, setDetail] = useState<InternshipOfferDetail | null>(null);
  const backLabel = useAdminBackLabel('offers');

  useEffect(() => {
    if (!id || !offerData) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    stageApi
      .applications(id)
      .then((apps) => {
        if (!cancelled) setDetail(mapStageDetailToAdminDetail(offerData, apps));
      })
      .catch(() => {
        if (!cancelled) setDetail(mapStageDetailToAdminDetail(offerData, []));
      });
    return () => {
      cancelled = true;
    };
  }, [id, offerData]);

  if (!id) {
    return <Navigate to="/admin/internship-offers" replace />;
  }

  if (loading) {
    return (
      <AdminLayout>
        <OffersListLoading />
      </AdminLayout>
    );
  }

  if (error || !detail) {
    return <Navigate to="/admin/internship-offers" replace />;
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        <AdminBackButton onClick={() => navigate('/admin/internship-offers')} label={backLabel} />

        <OfferSummaryCard detail={detail} />
        <OfferApplicantsTable detail={detail} />
      </div>
    </AdminLayout>
  );
};

const OfferSummaryCard: FunctionComponent<{ detail: InternshipOfferDetail }> = ({ detail }) => {
  const { t } = useTranslation();
  const { offerStatus } = useAdminTableValues();
  const statusClass =
    statusHeaderClass[detail.status] ??
    'admin-field border border-[var(--admin-border)] bg-[var(--admin-input-bg)] text-[var(--admin-text)]';

  return (
    <div className="box-border flex w-full flex-col gap-6 admin-module-panel text-left font-inter text-base text-[var(--admin-text)]">
      <div className="box-border flex min-h-[78px] flex-col items-start justify-between gap-5 px-6 pb-1.5 pt-6 sm:flex-row sm:items-start">
        <div className="flex min-w-0 max-w-[298px] flex-col items-start gap-2">
          <h1 className="font-inter text-lg font-bold leading-tight text-[var(--admin-text)]">{detail.title}</h1>
          <p className="font-inter text-base font-normal leading-6 text-[var(--admin-text-secondary)]">
            {detail.company} • {detail.location}
          </p>
        </div>
        <div
          className={`inline-flex h-[22px] min-w-[51.5px] shrink-0 items-center justify-center rounded-lg px-2 py-0.5 text-xs font-medium leading-4 ${statusClass}`}
        >
          {offerStatus(detail.status)}
        </div>
      </div>

      <div className="flex flex-col gap-6 px-6 pb-6 pt-0 text-[18px] text-[var(--admin-text)]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="flex min-h-12 flex-col gap-1 text-[14px] text-[var(--admin-text-secondary)]">
            <span className="leading-5">{t(`${LEGACY_PREFIX}.postedOn`)}</span>
            <span className="text-[16px] font-medium leading-6 text-[var(--admin-text)]">{detail.postedOn}</span>
          </div>
          <div className="flex min-h-12 flex-col gap-1 text-[14px] text-[var(--admin-text-secondary)]">
            <span className="leading-5">{t(`${LEGACY_PREFIX}.applicationDeadline`)}</span>
            <span className="text-[16px] font-medium leading-6 text-[var(--admin-text)]">{detail.deadline}</span>
          </div>
          <div className="flex min-h-12 flex-col gap-1 text-[14px] text-[var(--admin-text-secondary)]">
            <span className="leading-5">{t(`${LEGACY_PREFIX}.totalApplicants`)}</span>
            <span className="text-[16px] font-medium leading-6 text-[var(--admin-text)]">
              {t('admin.modules.offers.listPages.studentsCount', { count: detail.applicants })}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="font-inter text-[18px] font-semibold leading-[27px] text-[var(--admin-text)]">
            {t(`${LEGACY_PREFIX}.description`)}
          </h2>
          <p className="font-inter text-[14px] leading-[22.75px] text-[var(--admin-text-secondary)]">{detail.description}</p>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="font-inter text-[18px] font-semibold leading-[27px] text-[var(--admin-text)]">
            {t(`${LEGACY_PREFIX}.requiredSkills`)}
          </h2>
          <div className="flex flex-wrap gap-2">
            {detail.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex min-h-[22px] items-center justify-center rounded-num-8 border border-[var(--admin-border)] px-2 py-0.5 font-inter text-[12px] font-medium leading-4 text-[var(--admin-text)]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const OfferApplicantsTable: FunctionComponent<{ detail: InternshipOfferDetail }> = ({ detail }) => {
  const { t } = useTranslation();
  const { tableColumn, actionView, actionAccept, actionReject, actionMessage } = useOffersListLabels();
  const { emptyState } = useAdminCopy();
  const { offerStatus } = useAdminTableValues();
  const rows = detail.studentApplications;
  const applicantCount = rows.length;

  return (
    <div className="relative box-border flex w-full flex-col items-start gap-6 admin-module-panel text-left font-inter text-[16px] text-[var(--admin-text)]">
      <div className="relative h-[70px] w-full shrink-0">
        <h2 className="absolute left-6 top-[22px] font-inter text-base font-medium leading-4 text-[var(--admin-text)]">
          {t(`${LEGACY_PREFIX}.applicantsTitle`, { count: applicantCount })}
        </h2>
        <p className="absolute left-6 top-[44px] font-inter text-base font-normal leading-6 text-[var(--admin-text-secondary)]">
          {t(`${LEGACY_PREFIX}.applicantsSubtitle`)}
        </p>
      </div>

      <div className="box-border flex w-full flex-col items-start px-6 pb-6 pt-0 font-inter text-num-14 leading-num-20 text-[var(--admin-text)]">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1180px] border-collapse">
            <thead>
              <tr className="box-border h-10 border-b border-solid border-[var(--admin-border)]">
                <th className="px-2 pb-2.5 pt-2.5 text-left font-medium leading-num-20 text-[var(--admin-text-secondary)]">
                  {tableColumn('student')}
                </th>
                <th className="px-2 pb-2.5 pt-2.5 text-left font-medium leading-num-20 text-[var(--admin-text-secondary)]">
                  {tableColumn('class')}
                </th>
                <th className="px-2 pb-2.5 pt-2.5 text-left font-medium leading-num-20 text-[var(--admin-text-secondary)]">
                  {tableColumn('field')}
                </th>
                <th className="px-2 pb-2.5 pt-2.5 text-left font-medium leading-num-20 text-[var(--admin-text-secondary)]">
                  {tableColumn('matchScore')}
                </th>
                <th className="px-2 pb-2.5 pt-2.5 text-left font-medium leading-num-20 text-[var(--admin-text-secondary)]">
                  {tableColumn('status')}
                </th>
                <th className="px-2 pb-2.5 pt-2.5 text-right font-medium leading-num-20 text-[var(--admin-text-secondary)]">
                  {tableColumn('actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <AdminTableEmptyState colSpan={6} title={emptyState('noApplications')} />
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="box-border min-h-[49px] border-b border-solid border-[var(--admin-border)] last:border-b-0"
                  >
                    <td className="box-border min-h-[49px] px-2 py-[13px] align-middle font-medium leading-num-20 text-[var(--admin-text)]">
                      {row.studentName}
                    </td>
                    <td className="box-border min-h-[49px] px-2 py-[13px] align-middle font-normal leading-num-20 text-[var(--admin-text)]">
                      {row.classLabel}
                    </td>
                    <td className="box-border min-h-[49px] px-2 py-[13px] align-middle font-normal leading-num-20 text-[var(--admin-text)]">
                      {row.field}
                    </td>
                    <td className="box-border min-h-[49px] px-2 py-[13px] align-middle">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 shrink-0 overflow-hidden rounded-full bg-[var(--admin-surface-inset)]">
                          <div
                            className="h-2 rounded-full bg-[var(--admin-brand)]"
                            style={{ width: `${row.matchScore}%` }}
                          />
                        </div>
                        <span className="font-medium leading-num-20 text-[var(--admin-text)]">{row.matchScore}%</span>
                      </div>
                    </td>
                    <td className="box-border min-h-[49px] px-2 py-[13px] align-middle">
                      <span
                        className={`inline-flex min-h-[22px] items-center justify-center rounded-num-8 px-2 py-0.5 text-[12px] font-medium leading-4 ${statusRowClass[row.status]}`}
                      >
                        {offerStatus(row.status)}
                      </span>
                    </td>
                    <td className="box-border min-h-[49px] px-2 py-2 align-middle">
                      <div className="flex flex-wrap items-center justify-end gap-2 text-center">
                        <button type="button" className={adminTableBtn}>
                          <Eye className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                          <span>{actionView}</span>
                        </button>
                        <button type="button" className={adminTableBtn}>
                          <Check className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                          <span>{actionAccept}</span>
                        </button>
                        <button type="button" className={adminTableBtn}>
                          <X className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                          <span>{actionReject}</span>
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-num-8 admin-btn-primary px-2.5 font-inter text-num-14 font-medium leading-num-20 text-white hover:opacity-90"
                        >
                          <Mail className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                          <span>{actionMessage}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewInternshipOfferPage;
