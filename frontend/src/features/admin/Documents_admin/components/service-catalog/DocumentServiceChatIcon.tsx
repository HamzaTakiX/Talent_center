import { FunctionComponent } from 'react';
import { resolveServiceIcon } from './serviceCatalogIcons';
import { isCustomServiceColor, serviceAccentStyle } from './serviceCatalogColor';

type DocumentServiceChatIconProps = {
  iconKey?: string;
  colorTheme?: string;
  size?: 'list' | 'header' | 'panel';
  className?: string;
};

const ICON_SIZE_CLASS = {
  list: 'h-4 w-4',
  header: 'h-5 w-5',
  panel: 'h-6 w-6',
} as const;

const DocumentServiceChatIcon: FunctionComponent<DocumentServiceChatIconProps> = ({
  iconKey = 'file-text',
  colorTheme = 'brand',
  size = 'list',
  className = '',
}) => {
  const Icon = resolveServiceIcon(iconKey);
  const customColor = isCustomServiceColor(colorTheme);
  const themeClass = customColor ? '' : `admin-doc-svc-card--${colorTheme}`;

  return (
    <span className={`inline-flex shrink-0 ${themeClass} ${className}`.trim()} aria-hidden>
      <span className="admin-doc-svc-card__icon" style={serviceAccentStyle(colorTheme)}>
        <Icon className={ICON_SIZE_CLASS[size]} strokeWidth={1.5} />
      </span>
    </span>
  );
};

export default DocumentServiceChatIcon;
