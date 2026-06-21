import { FunctionComponent, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Copy, ExternalLink, Link2 } from 'lucide-react';
import { useAdminToast } from '../../../dashboard/context/AdminToastContext';
import { formatSourceUrlDisplay } from '../../../shared/formatSourceUrl';

const PREFIX = 'admin.forms.createOfferStudio.import.metadata';

interface ImportSourceUrlBarProps {
  url: string;
}

const ImportSourceUrlBar: FunctionComponent<ImportSourceUrlBarProps> = ({ url }) => {
  const { t } = useTranslation();
  const toast = useAdminToast();
  const [copied, setCopied] = useState(false);

  const display = useMemo(() => formatSourceUrlDisplay(url), [url]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success(t(`${PREFIX}.linkCopied`));
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t(`${PREFIX}.copyFailed`));
    }
  }, [toast, t, url]);

  return (
    <div className="offer-import-source-url">
      <Link2 className="offer-import-source-url__icon" aria-hidden />
      <div className="offer-import-source-url__text" title={url}>
        {display.host ? (
          <>
            <span className="offer-import-source-url__host">{display.host}</span>
            <span className="offer-import-source-url__path">{display.path}</span>
          </>
        ) : (
          <span className="offer-import-source-url__path">{display.path}</span>
        )}
      </div>
      <div className="offer-import-source-url__actions">
        <button
          type="button"
          className="offer-import-source-url__btn"
          onClick={() => void handleCopy()}
          aria-label={t(`${PREFIX}.copyLink`)}
          title={t(`${PREFIX}.copyLink`)}
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden />
          )}
        </button>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="offer-import-source-url__btn offer-import-source-url__btn--open"
          aria-label={t(`${PREFIX}.openLink`)}
          title={t(`${PREFIX}.openLink`)}
        >
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>
    </div>
  );
};

export default ImportSourceUrlBar;
