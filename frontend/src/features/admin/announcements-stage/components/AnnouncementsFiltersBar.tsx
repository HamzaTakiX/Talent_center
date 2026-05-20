import { FunctionComponent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminSearchInput from '../../ui/AdminSearchInput';
import AdminSelectField from '../../ui/AdminSelectField';
import AdminToggle from '../../account/components/AdminToggle';

export interface AnnListFilters {
  search?: string;
  status?: string;
  priority?: string;
  type?: string;
  internship_only?: boolean;
}

interface Props {
  filters: AnnListFilters;
  onChange: (next: AnnListFilters) => void;
}

const STATUS_OPTS = ['', 'DRAFT', 'SCHEDULED', 'PUBLISHED', 'EXPIRED', 'ARCHIVED'];
const PRIORITY_OPTS = ['', 'NORMAL', 'IMPORTANT', 'URGENT', 'PINNED', 'INSTITUTIONAL_CRITICAL'];

const AnnouncementsFiltersBar: FunctionComponent<Props> = ({ filters, onChange }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);

  const statusOptions = useMemo(
    () =>
      STATUS_OPTS.map((s) => ({
        value: s,
        label: s
          ? t(`admin.announcementsModule.status.${s}`, { defaultValue: s })
          : t('admin.announcementsModule.filters.allStatuses'),
      })),
    [t],
  );

  const hasActive = Boolean(filters.status || filters.priority || filters.type || filters.internship_only);

  return (
    <section className="admin-ann-filters">
      <div className="admin-ann-filters__head">
        <div className="admin-ann-filters__search">
          <AdminSearchInput
            value={filters.search ?? ''}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            onClear={() => onChange({ ...filters, search: '' })}
            placeholder={t('admin.search.announcements')}
            aria-label={t('admin.search.announcements')}
          />
        </div>
        <div className="admin-ann-filters__actions">
          <button
            type="button"
            className={`admin-ann-filters__toggle ${expanded ? 'is-active' : ''}`}
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            <Filter className="h-4 w-4" aria-hidden />
            {t('admin.announcementsModule.filters.advanced')}
          </button>
          {hasActive ? (
            <button
              type="button"
              className="admin-ann-filters__toggle"
              onClick={() => onChange({ search: filters.search })}
            >
              <X className="h-4 w-4" aria-hidden />
              {t('admin.announcementsModule.filters.clear')}
            </button>
          ) : null}
          <button
            type="button"
            className="admin-btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
            onClick={() => navigate('/admin/announcements/create')}
          >
            <Plus className="h-4 w-4" aria-hidden />
            {t('admin.announcementsModule.empty.cta')}
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="admin-ann-filters__panel">
          <AdminSelectField
            aria-label={t('admin.announcementsModule.filters.status')}
            value={filters.status ?? ''}
            onChange={(v) => onChange({ ...filters, status: v || undefined })}
            options={statusOptions}
          />
          <AdminSelectField
            aria-label={t('admin.announcementsModule.filters.priority')}
            value={filters.priority ?? ''}
            onChange={(v) => onChange({ ...filters, priority: v || undefined })}
            options={PRIORITY_OPTS.map((p) => ({
              value: p,
              label: p
                ? t(`admin.announcementsModule.form.priorities.${p}`)
                : t('admin.announcementsModule.filters.allPriorities'),
            }))}
          />
        </div>
      ) : null}

      <div className="admin-ann-filters__toggles">
        <AdminToggle
          id="announcements-filter-internship-only"
          label={t('admin.announcementsModule.filters.internshipOnly')}
          checked={Boolean(filters.internship_only)}
          onChange={(checked) => onChange({ ...filters, internship_only: checked || undefined })}
        />
      </div>
    </section>
  );
};

export default AnnouncementsFiltersBar;
