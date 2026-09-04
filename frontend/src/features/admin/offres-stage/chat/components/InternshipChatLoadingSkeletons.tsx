import { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

const CONV_SKELETON_COUNT = 5;
const MESSAGE_SKELETON_ROWS = 4;
const CONTEXT_FIELD_COUNT = 4;

function Shimmer({ className = '' }: { className?: string }) {
  return <div className={`admin-shimmer rounded-md ${className}`} aria-hidden />;
}

export const InternshipChatSidebarSkeleton: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <aside className="isi-sidebar" aria-busy="true" aria-live="polite">
      <div className="isi-sidebar-head isi-sidebar-head--brand">
        <div className="platform-header-brand">
          <Shimmer className="platform-header-brand-icon !rounded-[0.625rem]" />
          <div className="platform-header-brand-text min-w-0 space-y-1">
            <Shimmer className="h-[0.8125rem] w-28" />
            <Shimmer className="h-2.5 w-20" />
          </div>
        </div>
        <div className="isi-sidebar-actions flex gap-1">
          <Shimmer className="h-8 w-8 rounded-lg" />
          <Shimmer className="h-8 w-8 rounded-lg" />
        </div>
      </div>

      <div className="isi-search-wrap">
        <Shimmer className="h-[2.75rem] w-full rounded-xl" />
      </div>

      <nav className="isi-conv-list" aria-label={t('student.internshipOffers.chat.loadingSidebar')}>
        {Array.from({ length: CONV_SKELETON_COUNT }, (_, index) => (
          <div
            key={index}
            className="isi-chat-skeleton-conv"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <Shimmer className="h-10 w-10 shrink-0 rounded-full" />
            <div className="isi-chat-skeleton-conv-body">
              <div className="flex items-center justify-between gap-2">
                <Shimmer className="h-3.5 w-[58%]" />
                <Shimmer className="h-2.5 w-10 shrink-0" />
              </div>
              <Shimmer className="mt-1.5 h-2.5 w-[42%]" />
              <Shimmer className="mt-2 h-3 w-full" />
              <Shimmer className="mt-2 h-2.5 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export const InternshipChatMessagesSkeleton: FunctionComponent<{ embedded?: boolean }> = ({
  embedded = false,
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={embedded ? 'isi-chat-skeleton-messages' : 'isi-messages isi-chat-skeleton-messages'}
      aria-busy="true"
      aria-live="polite"
    >
      <p className="sr-only">
        {t('student.internshipOffers.chat.loadingMessages', { defaultValue: 'Chargement des messages…' })}
      </p>
      {Array.from({ length: MESSAGE_SKELETON_ROWS }, (_, index) => {
        const isOut = index % 2 === 1;
        return (
          <div
            key={index}
            className={`isi-chat-skeleton-msg ${isOut ? 'isi-chat-skeleton-msg--out' : ''}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Shimmer
              className={`isi-chat-skeleton-bubble ${isOut ? 'isi-chat-skeleton-bubble--out' : ''}`}
            />
            <Shimmer className="mt-1.5 h-2 w-10" />
          </div>
        );
      })}
    </div>
  );
};

export const InternshipChatWorkspaceSkeleton: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <section className="isi-chat" aria-busy="true" aria-live="polite">
      <header className="isi-chat-header">
        <div className="isi-chat-header-left">
          <Shimmer className="isi-avatar isi-avatar--header !rounded-full" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Shimmer className="h-3.5 w-48 max-w-full" />
            <Shimmer className="h-3 w-36 max-w-full" />
          </div>
        </div>
        <Shimmer className="hidden h-8 w-24 rounded-lg sm:block" />
      </header>

      <InternshipChatMessagesSkeleton />
      <p className="sr-only">{t('student.internshipOffers.chat.openingConversation')}</p>

      <footer className="isi-composer-wrap">
        <div className="isi-composer">
          <div className="isi-composer-tools">
            <div className="admin-shimmer h-[2.125rem] w-[2.125rem] shrink-0 rounded-full" />
          </div>
          <div className="admin-shimmer h-[1.375rem] min-h-[1.375rem] flex-1 rounded-md" />
          <div className="admin-shimmer isi-composer-send !rounded-full" />
        </div>
        <div className="isi-composer-meta">
          <div className="admin-shimmer h-2.5 w-56 rounded-md" />
        </div>
      </footer>
    </section>
  );
};

export const InternshipChatContextPanelSkeleton: FunctionComponent = () => {
  const { t } = useTranslation();

  return (
    <aside className="isi-inspector" aria-busy="true" aria-live="polite">
      <header className="isi-inspector-head">
        <Shimmer className="h-3.5 w-20" />
      </header>

      <Shimmer className="mx-4 mb-3 h-2.5 w-24" />

      <div className="isi-inspector-fields px-4">
        {Array.from({ length: CONTEXT_FIELD_COUNT }, (_, index) => (
          <div
            key={`offer-${index}`}
            className="isi-inspector-row isi-chat-skeleton-field"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <Shimmer className="h-7 w-7 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Shimmer className="h-2.5 w-16" />
              <Shimmer className="h-3.5 w-[78%]" />
            </div>
          </div>
        ))}
      </div>

      <div className="isi-inspector-divider" />

      <Shimmer className="mx-4 mb-3 h-2.5 w-28" />

      <div className="isi-inspector-fields px-4">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={`app-${index}`}
            className="isi-inspector-row isi-chat-skeleton-field"
            style={{ animationDelay: `${(index + 4) * 70}ms` }}
          >
            <Shimmer className="h-7 w-7 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Shimmer className="h-2.5 w-20" />
              <Shimmer className="h-3.5 w-[65%]" />
            </div>
          </div>
        ))}
      </div>

      <div className="isi-inspector-divider" />

      <div className="isi-inspector-actions px-1">
        <span className="sr-only">{t('student.internshipOffers.chat.loadingContext')}</span>
        <Shimmer className="mb-2 h-2.5 w-24" />
        <Shimmer className="h-10 w-full rounded-lg" />
      </div>
    </aside>
  );
};
