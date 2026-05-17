import { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Download, FilePenLine, FileUp, X, AlertTriangle } from 'lucide-react';
import AdminModuleHistory from '../../../shared/admin-module-history/AdminModuleHistory';
import type { AdminHistoryRowDisplay } from '../../../shared/admin-module-history/adminHistoryTypes';
import {
  ADMIN_HISTORY_ICON_PROPS,
  adminHistoryBadgeClass,
  adminHistoryCircleClass,
  type AdminHistoryCircleVariant,
} from '../../../shared/admin-module-history/adminHistoryUi';
import {
  DocumentsTimelineRow,
  DocumentsTimelineStatus,
  documentsHistorySeed,
} from '../data/documentsHistoryMock';

const STATUS_PREFIX = 'admin.historyUi.documents.status';
const FILTER_PREFIX = 'admin.historyUi.documents.filters';
const ROW_PREFIX = 'admin.historyUi.documents.rows';

function statusVariant(s: DocumentsTimelineStatus): AdminHistoryCircleVariant {
  switch (s) {
    case 'document_validated':
      return 'success';
    case 'document_rejected':
      return 'danger';
    case 'document_uploaded':
      return 'event';
    case 'correction_requested':
      return 'warning';
    case 'document_downloaded':
      return 'interview';
    default:
      return 'neutral';
  }
}

function glyph(row: DocumentsTimelineRow) {
  switch (row.status) {
    case 'document_uploaded':
      return <FileUp {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'document_validated':
      return <Check {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'document_rejected':
      return <X {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'correction_requested':
      return <FilePenLine {...ADMIN_HISTORY_ICON_PROPS} />;
    case 'document_downloaded':
      return <Download {...ADMIN_HISTORY_ICON_PROPS} />;
    default:
      return <AlertTriangle {...ADMIN_HISTORY_ICON_PROPS} />;
  }
}

const DocumentsHistoryPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [docType, setDocType] = useState('all');
  const [reviewState, setReviewState] = useState('all');

  const statusLabel = useCallback(
    (status: DocumentsTimelineStatus) => t(`${STATUS_PREFIX}.${status}`),
    [t]
  );

  const rowField = useCallback(
    (rowId: string, field: 'actorName' | 'headline', fallback: string) => {
      const key = `${ROW_PREFIX}.${rowId}.${field}`;
      const value = t(key);
      return value === key ? fallback : value;
    },
    [t]
  );

  const rowToDisplay = useCallback(
    (row: DocumentsTimelineRow): AdminHistoryRowDisplay => {
      const variant = statusVariant(row.status);
      return {
        id: row.id,
        glyph: glyph(row),
        badgeLabel: statusLabel(row.status),
        badgeClassName: adminHistoryBadgeClass(variant),
        circleBgClassName: adminHistoryCircleClass(variant),
        circleVariant: variant,
        actorName: rowField(row.id, 'actorName', row.actorName),
        headline: rowField(row.id, 'headline', row.headline),
        metaLine: row.fileRef,
        date: row.date,
        time: row.time,
      };
    },
    [statusLabel, rowField]
  );

  const docTypeOptions = useMemo(
    () => [
      { value: 'convention', label: t(`${FILTER_PREFIX}.convention`) },
      { value: 'attestation', label: t(`${FILTER_PREFIX}.attestation`) },
      { value: 'financial', label: t(`${FILTER_PREFIX}.financial`) },
      { value: 'other', label: t(`${FILTER_PREFIX}.other`) },
    ],
    [t]
  );

  const reviewStateOptions = useMemo(
    () => [
      { value: 'pending', label: t(`${FILTER_PREFIX}.pending`) },
      { value: 'action_required', label: t(`${FILTER_PREFIX}.action_required`) },
      { value: 'cleared', label: t(`${FILTER_PREFIX}.cleared`) },
    ],
    [t]
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return documentsHistorySeed.filter((row) => {
      if (docType !== 'all' && row.docType !== docType) return false;
      if (reviewState !== 'all' && row.reviewState !== reviewState) return false;
      if (!q) return true;
      const display = rowToDisplay(row);
      const hay = [
        display.actorName,
        display.headline,
        row.fileRef,
        statusLabel(row.status),
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [search, docType, reviewState, rowToDisplay, statusLabel]);

  return (
    <AdminModuleHistory
      searchValue={search}
      onSearchChange={setSearch}
      filters={[
        {
          ariaLabel: t(`${FILTER_PREFIX}.docTypeAria`),
          placeholderOptionLabel: t(`${FILTER_PREFIX}.docType`),
          value: docType,
          onChange: setDocType,
          options: docTypeOptions,
        },
        {
          ariaLabel: t(`${FILTER_PREFIX}.reviewStateAria`),
          placeholderOptionLabel: t(`${FILTER_PREFIX}.reviewState`),
          value: reviewState,
          onChange: setReviewState,
          options: reviewStateOptions,
        },
      ]}
      rows={rows.map(rowToDisplay)}
    />
  );
};

export default DocumentsHistoryPage;
