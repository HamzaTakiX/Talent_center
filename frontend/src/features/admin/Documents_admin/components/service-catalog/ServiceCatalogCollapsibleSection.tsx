import { FunctionComponent, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface Props {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

const ServiceCatalogCollapsibleSection: FunctionComponent<Props> = ({
  title,
  description,
  defaultOpen = false,
  children,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`admin-doc-studio-collapsible ${open ? 'is-open' : ''}`}>
      <button
        type="button"
        className="admin-doc-studio-collapsible__trigger"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="admin-doc-studio-collapsible__trigger-text">
          <span className="admin-doc-studio-collapsible__title">{title}</span>
          {description && (
            <span className="admin-doc-studio-collapsible__desc">{description}</span>
          )}
        </span>
        <ChevronDown className="admin-doc-studio-collapsible__chevron h-4 w-4" aria-hidden />
      </button>
      {open && <div className="admin-doc-studio-collapsible__body">{children}</div>}
    </div>
  );
};

export default ServiceCatalogCollapsibleSection;
