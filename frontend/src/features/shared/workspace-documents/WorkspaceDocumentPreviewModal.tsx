import { FunctionComponent, useEffect, useState } from 'react';
import { Download, Eye, Loader2 } from 'lucide-react';
import AdminModal from '../../admin/ui/AdminModal';
import type { WorkspaceDocument } from './types';
import {
  buildWorkspaceDocumentPreview,
  revokeWorkspaceDocumentPreview,
  type WorkspaceDocumentPreview,
} from './preview';
import './workspace-document-preview.css';

export interface WorkspaceDocumentPreviewLabels {
  title: string;
  loading: string;
  error: string;
  unsupported: string;
  close: string;
  download: string;
}

interface WorkspaceDocumentPreviewModalProps {
  workspaceDocument: WorkspaceDocument | null;
  labels: WorkspaceDocumentPreviewLabels;
  onClose: () => void;
  onDownload: (doc: WorkspaceDocument) => void;
}

const WorkspaceDocumentPreviewModal: FunctionComponent<WorkspaceDocumentPreviewModalProps> = ({
  workspaceDocument,
  labels,
  onClose,
  onDownload,
}) => {
  const [preview, setPreview] = useState<WorkspaceDocumentPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [activeSheet, setActiveSheet] = useState(0);

  useEffect(() => {
    if (!workspaceDocument) {
      setPreview(null);
      setLoading(false);
      setError(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);
    setActiveSheet(0);
    setPreview((current) => {
      revokeWorkspaceDocumentPreview(current);
      return null;
    });

    void buildWorkspaceDocumentPreview(workspaceDocument)
      .then((next) => {
        if (cancelled) {
          revokeWorkspaceDocumentPreview(next);
          return;
        }
        setPreview(next);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      setPreview((current) => {
        revokeWorkspaceDocumentPreview(current);
        return null;
      });
    };
  }, [workspaceDocument]);

  return (
    <AdminModal
      open={Boolean(workspaceDocument)}
      onClose={onClose}
      title={workspaceDocument?.name ?? labels.title}
      description={labels.title}
      closeAriaLabel={labels.close}
      headerIcon={Eye}
      maxWidthClass="max-w-5xl workspace-doc-preview-modal"
      bodyClassName="workspace-doc-preview"
      footer={
        workspaceDocument ? (
          <div className="workspace-doc-preview__footer">
            <div className="workspace-doc-preview__footer-meta">
              <p className="workspace-doc-preview__footer-name" title={workspaceDocument.name}>
                {workspaceDocument.name}
              </p>
              <p className="workspace-doc-preview__footer-details">
                <span>{workspaceDocument.sizeLabel}</span>
                <span aria-hidden>·</span>
                <span>{workspaceDocument.version}</span>
              </p>
            </div>
            <button
              type="button"
              className="workspace-doc-preview__download"
              onClick={() => onDownload(workspaceDocument)}
            >
              <Download className="h-4 w-4" strokeWidth={2} aria-hidden />
              <span>{labels.download}</span>
            </button>
          </div>
        ) : null
      }
    >
      {loading ? (
        <p className="workspace-doc-preview__status">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          <span>{labels.loading}</span>
        </p>
      ) : null}

      {!loading && error ? (
        <p className="workspace-doc-preview__status" role="alert">
          {labels.error}
        </p>
      ) : null}

      {!loading && !error && preview?.kind === 'pdf' ? (
        <iframe
          className="workspace-doc-preview__frame"
          src={preview.objectUrl}
          title={workspaceDocument?.name ?? labels.title}
        />
      ) : null}

      {!loading && !error && preview?.kind === 'html' ? (
        <iframe
          className="workspace-doc-preview__frame"
          sandbox=""
          srcDoc={preview.html}
          title={workspaceDocument?.name ?? labels.title}
        />
      ) : null}

      {!loading && !error && preview?.kind === 'docx' ? (
        <div
          className="workspace-doc-preview__paper"
          dangerouslySetInnerHTML={{ __html: preview.html }}
        />
      ) : null}

      {!loading && !error && preview?.kind === 'image' ? (
        <img
          className="workspace-doc-preview__image"
          src={preview.objectUrl}
          alt={workspaceDocument?.name ?? labels.title}
        />
      ) : null}

      {!loading && !error && preview?.kind === 'text' ? (
        <pre className="workspace-doc-preview__text">{preview.text}</pre>
      ) : null}

      {!loading && !error && preview?.kind === 'spreadsheet' ? (
        <div className="workspace-doc-preview__sheet">
          {preview.sheets.length > 1 ? (
            <div className="workspace-doc-preview__sheet-tabs" role="tablist">
              {preview.sheets.map((sheet, index) => (
                <button
                  key={sheet.name}
                  type="button"
                  role="tab"
                  aria-selected={activeSheet === index}
                  className={`workspace-doc-preview__sheet-tab ${activeSheet === index ? 'is-active' : ''}`}
                  onClick={() => setActiveSheet(index)}
                >
                  {sheet.name}
                </button>
              ))}
            </div>
          ) : null}
          <div className="workspace-doc-preview__sheet-scroll">
            <table className="workspace-doc-preview__table">
              <tbody>
                {(preview.sheets[activeSheet] ?? preview.sheets[0])?.rows.map((row, rowIndex) => (
                  <tr key={`row-${rowIndex}`}>
                    {row.map((cell, cellIndex) => {
                      const Tag = rowIndex === 0 ? 'th' : 'td';
                      return (
                        <Tag key={`cell-${rowIndex}-${cellIndex}`}>{cell}</Tag>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {!loading && !error && preview?.kind === 'unsupported' ? (
        <p className="workspace-doc-preview__status">{labels.unsupported}</p>
      ) : null}
    </AdminModal>
  );
};

export default WorkspaceDocumentPreviewModal;
