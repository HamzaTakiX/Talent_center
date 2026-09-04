import { FunctionComponent } from 'react';
import { Calendar, CheckCircle } from 'lucide-react';
import DocumentsOverviewStatGrid from '../../shared/DocumentsOverviewStatGrid';

const ValidatedDocumentsOverviewCards: FunctionComponent = () => (
  <DocumentsOverviewStatGrid
    items={[
      {
        label: 'Total Validated',
        value: '789',
        badge: 'Validés',
        icon: CheckCircle,
        accent: '#22c55e',
        accentBg: 'rgba(34, 197, 94, 0.16)',
      },
      {
        label: 'This Month',
        value: '156',
        badge: '20% du total',
        icon: Calendar,
        accent: '#3b82f6',
        accentBg: 'rgba(59, 130, 246, 0.16)',
        piePercent: 20,
      },
      {
        label: 'This Week',
        value: '45',
        badge: '6% du total',
        icon: Calendar,
        accent: '#8b5cf6',
        accentBg: 'rgba(139, 92, 246, 0.16)',
        piePercent: 6,
      },
      {
        label: 'Today',
        value: '12',
        badge: 'Aujourd\'hui',
        icon: Calendar,
        accent: '#06b6d4',
        accentBg: 'rgba(6, 182, 212, 0.16)',
        piePercent: 2,
      },
    ]}
  />
);

export default ValidatedDocumentsOverviewCards;
