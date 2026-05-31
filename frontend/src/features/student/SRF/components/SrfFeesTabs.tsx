import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import type { SrfFeeTab, SrfFeeTabId } from '../types';
import { SRF_TAB_ACTIVE, SRF_TAB_BAR, SRF_TAB_INACTIVE } from '../constants/srfStyles';

interface SrfFeesTabsProps {
  tabs: SrfFeeTab[];
  activeTabId: SrfFeeTabId;
  onTabChange: (tabId: SrfFeeTabId) => void;
}

const tabKeyMap: Record<SrfFeeTabId, 'all' | 'pending' | 'partiallyPaid' | 'paid' | 'overdue'> = {
  all: 'all',
  unpaid: 'pending',
  partial: 'partiallyPaid',
  paid: 'paid',
  late: 'overdue',
};

const SrfFeesTabs: FunctionComponent<SrfFeesTabsProps> = ({ tabs, activeTabId, onTabChange }) => {
  const { t } = useTranslation();

  return (
    <div className={SRF_TAB_BAR} role="tablist" aria-label={t('student.srf.filterFees')}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const label = `${t(`student.srf.tabs.${tabKeyMap[tab.id]}`)} (${tab.count})`;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={isActive ? SRF_TAB_ACTIVE : SRF_TAB_INACTIVE}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default SrfFeesTabs;
