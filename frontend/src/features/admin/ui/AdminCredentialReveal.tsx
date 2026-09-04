import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Check, Copy, Eye, EyeOff, KeyRound, Loader2, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { adminAdministratorsApi } from '../api/administrators';
import { adminEncadrantsApi } from '../api/encadrants';
import { adminStudentsApi } from '../api/students';

export type AdminCredentialKind = 'student' | 'encadrant' | 'administrator';

interface AdminCredentialRevealProps {
  kind: AdminCredentialKind;
  userId: number | null;
  enabled?: boolean;
}

async function fetchPassword(kind: AdminCredentialKind, userId: number): Promise<string> {
  if (kind === 'student') return adminStudentsApi.revealCredential(userId);
  if (kind === 'encadrant') return adminEncadrantsApi.revealCredential(userId);
  return adminAdministratorsApi.revealCredential(userId);
}

async function regeneratePassword(kind: AdminCredentialKind, userId: number): Promise<string> {
  if (kind === 'student') return adminStudentsApi.regeneratePassword(userId);
  if (kind === 'encadrant') return adminEncadrantsApi.regeneratePassword(userId);
  return adminAdministratorsApi.regeneratePassword(userId);
}

const PREFIX = 'admin.common.detailModal.credentials';

const AdminCredentialReveal: FunctionComponent<AdminCredentialRevealProps> = ({
  kind,
  userId,
  enabled = true,
}) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const loadPassword = useCallback(async () => {
    if (!enabled || userId == null) return;
    setLoading(true);
    setError('');
    try {
      const value = await fetchPassword(kind, userId);
      setPassword(value);
      setVisible(true);
    } catch {
      setError(t(`${PREFIX}.error`));
      setPassword(null);
    } finally {
      setLoading(false);
    }
  }, [enabled, kind, userId, t]);

  useEffect(() => {
    if (!enabled || userId == null) {
      setPassword(null);
      setError('');
      return;
    }
    void loadPassword();
  }, [enabled, userId, kind, loadPassword]);

  const handleRegenerate = async () => {
    if (!enabled || userId == null || regenerating) return;
    setRegenerating(true);
    setError('');
    try {
      const next = await regeneratePassword(kind, userId);
      setPassword(next);
      setVisible(true);
      setCopied(false);
    } catch {
      setError(t(`${PREFIX}.regenerateError`));
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  const busy = loading || regenerating;

  return (
    <section className="admin-credential-reveal" aria-label={t(`${PREFIX}.title`)}>
      <div className="admin-credential-reveal__head">
        <span className="admin-credential-reveal__icon" aria-hidden>
          <KeyRound className="h-4 w-4" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="admin-credential-reveal__title">{t(`${PREFIX}.title`)}</h4>
          <p className="admin-credential-reveal__hint">{t(`${PREFIX}.hint`)}</p>
        </div>
        <button
          type="button"
          className="admin-credential-reveal__regen"
          onClick={() => void handleRegenerate()}
          disabled={!enabled || userId == null || busy}
        >
          {regenerating ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          ) : (
            <RefreshCw className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          )}
          {t(`${PREFIX}.regenerate`)}
        </button>
      </div>

      {loading && !password ? (
        <p className="admin-credential-reveal__status">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
          {t(`${PREFIX}.loading`)}
        </p>
      ) : error && !password ? (
        <p className="admin-credential-reveal__status admin-credential-reveal__status--error">{error}</p>
      ) : password ? (
        <>
          {error ? (
            <p className="admin-credential-reveal__status admin-credential-reveal__status--error">{error}</p>
          ) : null}
          <div className="cred-password-reveal" style={{ marginTop: 0 }}>
            <code className="cred-password-reveal__code">
              {visible ? password : '•'.repeat(Math.max(12, password.length))}
            </code>
            <button
              type="button"
              className="cred-password-reveal__copy"
              onClick={() => setVisible((v) => !v)}
              title={visible ? t(`${PREFIX}.hide`) : t(`${PREFIX}.show`)}
              aria-label={visible ? t(`${PREFIX}.hide`) : t(`${PREFIX}.show`)}
            >
              {visible ? (
                <EyeOff className="h-4 w-4" strokeWidth={2} aria-hidden />
              ) : (
                <Eye className="h-4 w-4" strokeWidth={2} aria-hidden />
              )}
            </button>
            <button
              type="button"
              className="cred-password-reveal__copy"
              onClick={() => void handleCopy()}
              title={copied ? t(`${PREFIX}.copied`) : t(`${PREFIX}.copy`)}
              aria-label={copied ? t(`${PREFIX}.copied`) : t(`${PREFIX}.copy`)}
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-400" aria-hidden />
              ) : (
                <Copy className="h-4 w-4" strokeWidth={2} aria-hidden />
              )}
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
};

export default AdminCredentialReveal;
