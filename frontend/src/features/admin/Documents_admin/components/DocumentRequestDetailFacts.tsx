import { FunctionComponent, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface DocumentRequestDetailFact {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
}

interface DocumentRequestDetailFactsProps {
  items: DocumentRequestDetailFact[];
}

const DocumentRequestDetailFacts: FunctionComponent<DocumentRequestDetailFactsProps> = ({ items }) => (
  <dl className="admin-doc-detail-facts">
    {items.map((item) => {
      const Icon = item.icon;
      return (
        <div key={item.label} className="admin-doc-detail-facts__item">
          <dt>
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {item.label}
          </dt>
          <dd>{item.value}</dd>
        </div>
      );
    })}
  </dl>
);

export default DocumentRequestDetailFacts;
