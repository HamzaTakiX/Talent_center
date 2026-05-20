import { useEffect, useState } from 'react';
import { adminAdministratorsApi } from '../../api/administrators';
import { adminEncadrantsApi } from '../../api/encadrants';
import { adminStudentsApi } from '../../api/students';

export interface AdminDashboardLiveCounts {
  totalStudents: number | null;
  totalEncadrants: number | null;
  totalAdmins: number | null;
  studentsWithoutInternship: number | null;
  loading: boolean;
}

const emptyCounts: AdminDashboardLiveCounts = {
  totalStudents: null,
  totalEncadrants: null,
  totalAdmins: null,
  studentsWithoutInternship: null,
  loading: true,
};

export const useAdminDashboardLiveCounts = (): AdminDashboardLiveCounts => {
  const [counts, setCounts] = useState<AdminDashboardLiveCounts>(emptyCounts);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setCounts((prev) => ({ ...prev, loading: true }));
      try {
        const [studentStats, encadrantsPage, adminsPage] = await Promise.all([
          adminStudentsApi.stats(),
          adminEncadrantsApi.list({ page: 1, page_size: 1 }),
          adminAdministratorsApi.list({ page: 1, page_size: 1 }),
        ]);
        if (cancelled) return;
        setCounts({
          totalStudents: studentStats.total,
          studentsWithoutInternship: studentStats.without_internship,
          totalEncadrants: encadrantsPage.total,
          totalAdmins: adminsPage.total,
          loading: false,
        });
      } catch {
        if (!cancelled) {
          setCounts({ ...emptyCounts, loading: false });
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return counts;
};
