import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminSearchInput from '../../ui/AdminSearchInput';
import type { AnnListFilters } from '../constants/announcementListFilters';

export type { AnnListFilters };

interface Props {
  filters: AnnListFilters;
  onChange: (next: AnnListFilters) => void;
}

const AnnouncementsFiltersBar: FunctionComponent<Props> = ({ filters, onChange }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
            className="admin-btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
            onClick={() => navigate('/admin/announcements/create')}
          >
            <Plus className="h-4 w-4" aria-hidden />
            {t('admin.announcementsModule.empty.cta')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default AnnouncementsFiltersBar;
