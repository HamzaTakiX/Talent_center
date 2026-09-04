import { FunctionComponent, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AdminDetailCopyButtonProps {
  value: string;
  label: string;
}

const AdminDetailCopyButton: FunctionComponent<AdminDetailCopyButtonProps> = ({ value, label }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value.trim()) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <button
      type="button"
      className="admin-detail-copy-btn"
      onClick={() => void handleCopy()}
      aria-label={
        copied
          ? t('admin.common.detailModal.copiedValue', { label })
          : t('admin.common.detailModal.copyValue', { label })
      }
      title={
        copied
          ? t('admin.common.detailModal.copiedValue', { label })
          : t('admin.common.detailModal.copyValue', { label })
      }
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
      ) : (
        <Copy className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
      )}
    </button>
  );
};

export default AdminDetailCopyButton;
