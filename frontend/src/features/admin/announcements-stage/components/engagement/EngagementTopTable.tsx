import { FunctionComponent } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark,
  Eye,
  Megaphone,
  MousePointerClick,
  TrendingDown,
  TrendingUp,
  Minus,
} from 'lucide-react';
import { fadeInUp, staggerContainer } from '../../../dashboard/ui/animations';
import type { EngagementTopRow } from '../../types/engagementDashboard';

interface Props {
  rows: EngagementTopRow[];
  loading?: boolean;
}

const TrendBadge: FunctionComponent<{ trend: EngagementTopRow['trend'] }> = ({ trend }) => {
  const { t } = useTranslation();
  const P = 'admin.announcementsModule.engagement.trend';
  const Icon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  return (
    <span className={`admin-eng-trend admin-eng-trend--${trend}`}>
      <Icon className="h-3 w-3" aria-hidden />
      {t(`${P}.${trend}`)}
    </span>
  );
};

const EngagementTopTable: FunctionComponent<Props> = ({ rows, loading }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const P = 'admin.announcementsModule.engagement';

  if (!loading && rows.length === 0) {
    return (
      <motion.section {...fadeInUp} className="admin-eng-top">
        <header className="admin-eng-top__head">
          <h2 className="admin-ann-panel-title">{t(`${P}.topTitle`)}</h2>
          <p className="admin-eng-top__sub">{t(`${P}.topSubtitle`)}</p>
        </header>
        <div className="admin-ann-panel-empty">
          <Megaphone className="admin-ann-panel-empty__icon h-8 w-8" aria-hidden />
          <p className="admin-ann-panel-empty__title">{t(`${P}.empty.title`)}</p>
          <p className="admin-ann-panel-empty__subtitle">{t(`${P}.empty.subtitle`)}</p>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section {...fadeInUp} className="admin-eng-top" aria-labelledby="eng-top-title">
      <header className="admin-eng-top__head">
        <h2 id="eng-top-title" className="admin-ann-panel-title">
          {t(`${P}.topTitle`)}
        </h2>
        <p className="admin-eng-top__sub">{t(`${P}.topSubtitle`)}</p>
      </header>

      <div className="admin-eng-top__table-wrap">
        <table className="admin-eng-top__table">
          <thead>
            <tr>
              <th>{t(`${P}.table.announcement`)}</th>
              <th>{t(`${P}.table.score`)}</th>
              <th>{t(`${P}.table.views`)}</th>
              <th>{t(`${P}.table.saves`)}</th>
              <th>{t(`${P}.table.ctr`)}</th>
              <th>{t(`${P}.table.reco`)}</th>
              <th>{t(`${P}.table.reach`)}</th>
              <th>{t(`${P}.table.trend`)}</th>
            </tr>
          </thead>
          <motion.tbody variants={staggerContainer} initial="hidden" animate="visible">
            {(loading ? Array.from({ length: 5 }) : rows).map((row, i) => {
              if (loading) {
                return (
                  <tr key={`sk-${i}`} className="admin-eng-top__row admin-eng-top__row--skeleton">
                    <td colSpan={8}>
                      <div className="admin-shimmer h-10 w-full rounded-lg" />
                    </td>
                  </tr>
                );
              }
              const r = row as EngagementTopRow;
              return (
                <motion.tr
                  key={r.id}
                  className="admin-eng-top__row"
                  variants={fadeInUp}
                  onClick={() => navigate(`/admin/announcements/${r.id}`)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') navigate(`/admin/announcements/${r.id}`);
                  }}
                  role="link"
                >
                  <td>
                    <motion.div className="admin-eng-top__ann">
                      <span className="admin-eng-top__thumb" aria-hidden>
                        <Megaphone className="h-4 w-4" />
                      </span>
                      <span>
                        <strong>{r.title}</strong>
                        <small>{r.typeName ?? r.typeCode}</small>
                      </span>
                    </motion.div>
                  </td>
                  <td>
                    <span className="admin-eng-score-pill">{r.engagementScore}</span>
                  </td>
                  <td>
                    <span className="admin-eng-metric-inline">
                      <Eye className="h-3.5 w-3.5" aria-hidden />
                      {r.views}
                    </span>
                  </td>
                  <td>
                    <span className="admin-eng-metric-inline">
                      <Bookmark className="h-3.5 w-3.5" aria-hidden />
                      {r.saves}
                    </span>
                  </td>
                  <td>
                    <span className="admin-eng-metric-inline">
                      <MousePointerClick className="h-3.5 w-3.5" aria-hidden />
                      {r.ctr}%
                    </span>
                  </td>
                  <td>{r.recommendationScore}</td>
                  <td>{r.audienceReach}</td>
                  <td>
                    <TrendBadge trend={r.trend} />
                  </td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </div>
    </motion.section>
  );
};

export default EngagementTopTable;
