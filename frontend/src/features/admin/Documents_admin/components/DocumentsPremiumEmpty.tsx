import { FunctionComponent } from 'react';
import DocumentsSectionEmpty, { type DocumentsEmptySection } from './DocumentsSectionEmpty';

type Variant = 'requests' | 'search' | 'reservations' | 'templates' | 'resources' | 'workload' | 'analytics';

const VARIANT_TO_SECTION: Record<Variant, DocumentsEmptySection> = {
  requests: 'requests',
  search: 'search',
  reservations: 'reservations',
  templates: 'templates',
  resources: 'resources',
  workload: 'workload',
  analytics: 'analytics',
};

interface Props {
  variant: Variant;
}

const DocumentsPremiumEmpty: FunctionComponent<Props> = ({ variant }) => (
  <DocumentsSectionEmpty section={VARIANT_TO_SECTION[variant]} variant="panel" />
);

export default DocumentsPremiumEmpty;
