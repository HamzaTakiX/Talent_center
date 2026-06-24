import { FunctionComponent } from 'react';
import { ExternalLink, Link2 } from 'lucide-react';
import type { AnnouncementUrlLinkView } from '../../utils/announcementDetailViewModel';

type Props = {
  links: AnnouncementUrlLinkView[];
  loading?: boolean;
  title?: string;
  emptyLabel?: string;
  listAriaLabel?: string;
};

function displayUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname === '/' ? '' : parsed.pathname;
    return `${parsed.hostname}${path}`;
  } catch {
    return url;
  }
}

const AnnouncementInspectorUrls: FunctionComponent<Props> = ({
  links,
  loading = false,
  title = 'URLs',
  emptyLabel = 'Aucune URL',
  listAriaLabel = "Liens de l'annonce",
}) => (
  <>
    <div className="isi-inspector-section-title">{title}</div>
    {loading ? (
      <div className="isi-inspector-urls" aria-busy="true" aria-live="polite">
        <div className="isi-inspector-url isi-inspector-url--skeleton">
          <div className="admin-shimmer h-10 w-10 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="admin-shimmer h-3.5 w-[70%] rounded-md" />
            <div className="admin-shimmer h-2.5 w-[50%] rounded-md" />
          </div>
        </div>
      </div>
    ) : links.length === 0 ? (
      <p className="isi-inspector-urls-empty">{emptyLabel}</p>
    ) : (
      <ul className="isi-inspector-urls" aria-label={listAriaLabel}>
        {links.map((link) => (
          <li key={link.id} className="isi-inspector-url">
            <div className="isi-inspector-url__icon" aria-hidden>
              <Link2 className="size-4" strokeWidth={2} />
            </div>
            <div className="isi-inspector-url__body">
              <p className="isi-inspector-url__label">{link.label}</p>
              <p className="isi-inspector-url__href">{displayUrl(link.url)}</p>
            </div>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="isi-inspector-url__action"
              aria-label={`Ouvrir ${link.label}`}
            >
              <ExternalLink className="size-4" strokeWidth={2} />
            </a>
          </li>
        ))}
      </ul>
    )}
  </>
);

export default AnnouncementInspectorUrls;
