import { CSSProperties, FunctionComponent } from 'react';
import type { AdminChartLegendItem } from './types';

interface AdminChartLegendProps {
  items: AdminChartLegendItem[];
}

const AdminChartLegend: FunctionComponent<AdminChartLegendProps> = ({ items }) => {
  if (items.length === 0) return null;

  return (
    <div className="admin-chart-legend" role="list">
      {items.map((item) => {
        const toneStyle = {
          '--chart-accent': item.accent,
          '--chart-accent-bg': item.accentBg,
        } as CSSProperties;

        return (
          <span key={item.key} role="listitem" className="admin-chart-legend-card" style={toneStyle}>
            <span className="admin-chart-legend-card__bar" aria-hidden />
            <span className="admin-chart-legend-card__dot" style={{ background: item.color }} aria-hidden />
            <span className="admin-chart-legend-card__label">{item.label}</span>
            {item.value ? <span className="admin-chart-legend-card__value">{item.value}</span> : null}
          </span>
        );
      })}
    </div>
  );
};

export default AdminChartLegend;
