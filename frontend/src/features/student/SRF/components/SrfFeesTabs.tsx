import { FunctionComponent } from 'react';
import type { SrfFeeTab, SrfFeeTabId } from '../types';
import { SRF_TAB_ACTIVE, SRF_TAB_BAR, SRF_TAB_INACTIVE } from '../constants/srfStyles';

interface SrfFeesTabsProps {
  tabs: SrfFeeTab[];
  activeTabId: SrfFeeTabId;
  onTabChange: (tabId: SrfFeeTabId) => void;
}

const SrfFeesTabs: FunctionComponent<SrfFeesTabsProps> = ({ tabs, activeTabId, onTabChange }) => (
  <div className={SRF_TAB_BAR} role="tablist" aria-label="Filtrer les frais">
    {tabs.map((tab) => {
      const isActive = tab.id === activeTabId;
      const label =
        tab.id === 'partial'
          ? `Partiellement payé (${tab.count})`
          : tab.id === 'late'
            ? `En retard (${tab.count})`
            : `${tab.label} (${tab.count})`;

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

export default SrfFeesTabs;
