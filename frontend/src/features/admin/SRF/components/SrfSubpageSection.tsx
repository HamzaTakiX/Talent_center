import { FunctionComponent, ReactNode } from 'react';
import type { SrfSubpageId } from '../constants';
import { useSrfSubpage } from '../hooks/useSrfFinancial';
import SrfSubpageTable from './SrfSubpageTable';

interface SrfSubpageSectionProps {
  subpageId: SrfSubpageId;
  showRemaining?: boolean;
  children?: ReactNode;
}

/** Table + data hook for SRF drill-down pages. */
const SrfSubpageSection: FunctionComponent<SrfSubpageSectionProps> = ({
  subpageId,
  showRemaining = false,
  children,
}) => {
  const { config, rows, loading, error, reload } = useSrfSubpage(subpageId);

  if (children) {
    return <>{children}</>;
  }

  return (
    <SrfSubpageTable
      rows={rows}
      loading={loading}
      error={error}
      onRetry={reload}
      emptyTitleKey={config.emptyTitleKey}
      emptyDescriptionKey={config.emptyDescriptionKey}
      showRemaining={showRemaining}
    />
  );
};

export default SrfSubpageSection;
