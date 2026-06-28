import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase, CreditCard, Image, Shield, FileSignature, X } from 'lucide-react';
import type { ServiceAttachmentRule } from '../../types/documentServiceCatalog';
import { ATTACHMENT_PRESETS } from './serviceCatalogStudioSteps';

interface Props {
  attachments: ServiceAttachmentRule[];
  onChange: (attachments: ServiceAttachmentRule[]) => void;
}

const ICON_MAP: Record<string, typeof Shield> = {
  'id-card': CreditCard,
  'file-signature': FileSignature,
  image: Image,
  shield: Shield,
  briefcase: Briefcase,
  wallet: CreditCard,
};

const ServiceCatalogAttachmentChips: FunctionComponent<Props> = ({ attachments, onChange }) => {
  const { t } = useTranslation();
  const P = 'admin.documentsModule.catalog.form.studio.attachments';

  const selectedCodes = new Set(attachments.map((a) => a.code));

  const toggle = (code: string, labelKey: string) => {
    if (selectedCodes.has(code)) {
      onChange(attachments.filter((a) => a.code !== code));
    } else {
      onChange([...attachments, { code, labelKey, required: true }]);
    }
  };

  const remove = (code: string) => {
    onChange(attachments.filter((a) => a.code !== code));
  };

  return (
    <div className="admin-doc-studio-attachments">
      <p className="admin-doc-studio-attachments__label">{t(`${P}.presetsLabel`)}</p>
      <div className="admin-doc-studio-attachments__presets">
        {ATTACHMENT_PRESETS.map((preset) => {
          const Icon = ICON_MAP[preset.icon] ?? Shield;
          const selected = selectedCodes.has(preset.code);
          return (
            <button
              key={preset.code}
              type="button"
              className={`admin-doc-studio-attachment-chip ${selected ? 'is-selected' : ''}`}
              onClick={() => toggle(preset.code, preset.labelKey)}
              aria-pressed={selected}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span>{t(preset.labelKey)}</span>
            </button>
          );
        })}
      </div>

      {attachments.length > 0 && (
        <div className="admin-doc-studio-attachments__selected">
          <p className="admin-doc-studio-attachments__selected-label">{t(`${P}.selectedLabel`)}</p>
          <ul className="admin-doc-studio-attachments__list">
            {attachments.map((att) => (
              <li key={att.code} className="admin-doc-studio-attachments__item">
                <span>{t(att.labelKey)}</span>
                <span className="admin-doc-studio-attachments__badge">{t(`${P}.required`)}</span>
                <button
                  type="button"
                  className="admin-doc-studio-attachments__remove"
                  onClick={() => remove(att.code)}
                  aria-label={t(`${P}.remove`, { name: t(att.labelKey) })}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ServiceCatalogAttachmentChips;
