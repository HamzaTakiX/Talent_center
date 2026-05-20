import { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AdminListPageShell, AdminModuleHeader, AdminModulePanel } from '../../ui';
import { adminAnnouncementsApi } from '../../api/announcements';
import type { AnnouncementTypeItem } from '../types/announcement';

const AnnouncementTypesPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [types, setTypes] = useState<AnnouncementTypeItem[]>([]);

  useEffect(() => {
    adminAnnouncementsApi.types().then(setTypes);
  }, []);

  return (
    <AdminListPageShell onBack={() => navigate('/admin/announcements')} backTo="announcements">
      <AdminModuleHeader
        title={t('admin.announcementsModule.types.title')}
        subtitle={t('admin.announcementsModule.types.subtitle')}
      />
      <AdminModulePanel className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--admin-border)] text-[var(--admin-text-muted)]">
              <th className="text-start p-3">Code</th>
              <th className="text-start p-3">Name</th>
              <th className="text-start p-3">Priority</th>
              <th className="text-start p-3">Mutable</th>
              <th className="text-start p-3">Bannable</th>
              <th className="text-start p-3">Internship</th>
            </tr>
          </thead>
          <tbody>
            {types.map((tp) => (
              <tr key={tp.id} className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-brand-soft)]/30">
                <td className="p-3 font-mono text-xs">{tp.code}</td>
                <td className="p-3 font-medium">{tp.nameLocalized}</td>
                <td className="p-3">{tp.default_priority}</td>
                <td className="p-3">{tp.is_mutable ? '✓' : '—'}</td>
                <td className="p-3">{tp.is_bannable ? '✓' : '—'}</td>
                <td className="p-3">{tp.is_internship_related ? '✓' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminModulePanel>
    </AdminListPageShell>
  );
};

export default AnnouncementTypesPage;
