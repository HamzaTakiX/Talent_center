import { FunctionComponent } from 'react';

interface HistoryFilterRefreshBarProps {
  active: boolean;
  label: string;
}

const HistoryFilterRefreshBar: FunctionComponent<HistoryFilterRefreshBarProps> = ({ active, label }) => {
  if (!active) return null;

  return (
    <div className="admin-history-refresh" role="status" aria-live="polite" aria-atomic="true">
      <div className="admin-history-refresh__track" aria-hidden>
        <div className="admin-history-refresh__bar" />
      </div>
      <p className="admin-history-refresh__label">
        <span className="admin-history-refresh__dot" aria-hidden />
        {label}
      </p>
    </div>
  );
};

export default HistoryFilterRefreshBar;
