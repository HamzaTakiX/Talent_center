import { FunctionComponent } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { DocumentPendingRow } from '../data/documentsPendingValidationMockData';
import AdminMobileRowCard from '../../../../shared/AdminMobileRowCard';
import { AdminEmptyState, AdminTableScroll } from '../../../../ui';
import {
  adminTableBtnDanger,
  adminTableBtnMobileDanger,
  adminTableBtnMobileSuccess,
  adminTableBtnSuccess,
} from '../../../../ui/adminTableButtons';

interface DocumentsPendingCardContentProps {
  rows: DocumentPendingRow[];
}

const DocumentsPendingCardContent: FunctionComponent<DocumentsPendingCardContentProps> = ({ rows }) => {
  if (rows.length === 0) {
    return (
      <div className="px-4 pb-6 sm:px-6">
        <AdminEmptyState title="No documents match your filters." />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 px-4 pb-3 pt-0 sm:px-6 lg:hidden">
        {rows.map((row, index) => (
          <AdminMobileRowCard
            key={`${row.documentType}-${row.student}-${index}`}
            title={row.documentType}
            meta={row.student}
            fields={[{ label: 'Date', value: <span className="tabular-nums">{row.date}</span> }]}
            actions={
              <>
                <button type="button" className={adminTableBtnMobileSuccess}>
                  <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                  Approve
                </button>
                <button type="button" className={adminTableBtnMobileDanger}>
                  <XCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                  Reject
                </button>
              </>
            }
          />
        ))}
      </div>

      <div className="admin-module-table-wrap hidden min-w-0 px-4 pb-6 pt-0 sm:px-6 lg:block">
        <AdminTableScroll minWidth="720px" className="admin-table-scroll--panel">
          <thead>
            <tr>
              <th>Document Type</th>
              <th>Student</th>
              <th>Date</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.documentType}-${row.student}-${index}`}>
                <td className="font-medium">{row.documentType}</td>
                <td>{row.student}</td>
                <td className="tabular-nums">{row.date}</td>
                <td className="text-right">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button type="button" className={adminTableBtnSuccess}>
                      <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                      Approve
                    </button>
                    <button type="button" className={adminTableBtnDanger}>
                      <XCircle className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTableScroll>
      </div>
    </>
  );
};

export default DocumentsPendingCardContent;
