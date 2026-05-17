import { FunctionComponent, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentRequestsStats } from '../../data/documentRequestsMockData';
import type { DocumentRequestStat } from '../../types';
import DocumentStatCard from './DocumentStatCard';
import AdminKpiGrid from '../../../ui/AdminKpiGrid';

const DocumentsStats: FunctionComponent = () => {
  const navigate = useNavigate();

  const handleCardClick = useCallback(
    (statKey?: DocumentRequestStat['statKey']) => {
      if (statKey === 'total') navigate('/admin/documents/all');
      if (statKey === 'pending') navigate('/admin/documents/pending');
      if (statKey === 'validated') navigate('/admin/documents/validated');
      if (statKey === 'rejected') navigate('/admin/documents/rejected');
    },
    [navigate]
  );

  return (
    <AdminKpiGrid columns={4}>
      {documentRequestsStats.map((stat, index) => (
        <DocumentStatCard
          key={stat.labelKey ?? stat.label}
          label={stat.label}
          labelKey={stat.labelKey}
          value={stat.value}
          icon={stat.icon}
          index={index}
          onClick={() => handleCardClick(stat.statKey)}
        />
      ))}
    </AdminKpiGrid>
  );
};

export default DocumentsStats;
