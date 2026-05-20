import { FunctionComponent, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminListPageShell } from '../../ui';
import DocumentsNavStrip from './DocumentsNavStrip';
import '../styles/admin-documents.css';

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
}

const DocumentsSubPageLayout: FunctionComponent<Props> = ({ title, subtitle, children }) => {
  const navigate = useNavigate();
  return (
    <AdminListPageShell onBack={() => navigate('/admin/documents')} backTo="documents">
      <div className="admin-doc-workspace">
        <header className="admin-doc-hero admin-doc-hero--compact">
          <h1 className="admin-doc-hero__title">{title}</h1>
          <p className="admin-doc-hero__subtitle">{subtitle}</p>
        </header>
        <DocumentsNavStrip />
        {children}
      </div>
    </AdminListPageShell>
  );
};

export default DocumentsSubPageLayout;
