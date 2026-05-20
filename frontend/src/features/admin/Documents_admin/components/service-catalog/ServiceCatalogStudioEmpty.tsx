import { FunctionComponent } from 'react';
import { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
}

const ServiceCatalogStudioEmpty: FunctionComponent<Props> = ({ icon: Icon, title, description }) => (
  <div className="admin-doc-studio-empty">
    <span className="admin-doc-studio-empty__icon" aria-hidden>
      <Icon className="h-6 w-6" strokeWidth={1.5} />
    </span>
    <h4 className="admin-doc-studio-empty__title">{title}</h4>
    <p className="admin-doc-studio-empty__desc">{description}</p>
  </div>
);

export default ServiceCatalogStudioEmpty;
