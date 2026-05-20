import { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import apiClient from '../../../shared/api/client';

interface PublicCvPayload {
  title?: string;
  sections?: unknown[];
}

const PublicCvPage: FunctionComponent = () => {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cv, setCv] = useState<PublicCvPayload | null>(null);

  useEffect(() => {
    if (!token) {
      setError(t('cv.public.missingToken'));
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const res = await apiClient.get(`/cv/public/${token}/`);
        const body = res.data as { data?: PublicCvPayload } & PublicCvPayload;
        const payload = body?.data ?? body;
        if (!cancelled) setCv(payload);
      } catch {
        if (!cancelled) setError(t('cv.public.loadFailed'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, t]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 font-inter">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--admin-brand,#6366f1)]" />
        <span className="text-sm text-[var(--admin-text-muted,#64748b)]">{t('cv.public.loading')}</span>
      </div>
    );
  }

  if (error || !cv) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 font-inter">
        <p className="text-center text-sm text-red-600">{error || t('cv.public.loadFailed')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--admin-surface-inset,#f8fafc)] px-4 py-10 font-inter">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--admin-border,#e2e8f0)] bg-white p-6 shadow-sm">
        <h1 className="text-lg font-bold text-[var(--admin-text,#0f172a)]">
          {cv.title || t('cv.public.defaultTitle')}
        </h1>
        <p className="mt-2 text-sm text-[var(--admin-text-muted,#64748b)]">{t('cv.public.previewSoon')}</p>
      </div>
    </div>
  );
};

export default PublicCvPage;
