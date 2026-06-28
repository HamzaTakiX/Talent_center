import { FunctionComponent } from 'react';
import { ChevronRight, Clock, ExternalLink, FileText, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import InternshipInspectorRow from '../../../../admin/offres-stage/chat/components/InternshipInspectorRow';
import type { StudentDocumentConversation } from '../utils/studentDocumentChatMappers';
import DocumentServiceChatIcon from './DocumentServiceChatIcon';

type Props = {
  conversation: StudentDocumentConversation | null;
  onViewService: () => void;
};

const ICON = { className: 'size-4', strokeWidth: 2.25 };

const StudentDocumentContextPanel: FunctionComponent<Props> = ({
  conversation,
  onViewService,
}) => {
  const { t } = useTranslation();

  if (!conversation) return null;

  return (
    <aside className="isi-inspector">
      <header className="isi-inspector-head">
        <span className="isi-inspector-head-title">
          {t('student.documents.chat.contextTitle', { defaultValue: 'Contexte' })}
        </span>
      </header>

      <div className="isi-inspector-section-title">
        {t('student.documents.chat.sections.service', { defaultValue: 'Document' })}
      </div>
      <div className="isi-inspector-offer-card">
        <DocumentServiceChatIcon
          iconKey={conversation.iconKey}
          colorTheme={conversation.colorTheme}
          size="panel"
        />
        <div className="isi-inspector-offer-card-copy min-w-0">
          <p className="isi-inspector-offer-card-title">{conversation.serviceName}</p>
        </div>
      </div>

      <div className="isi-inspector-fields isi-inspector-fields--card">
        <InternshipInspectorRow
          icon={<FileText {...ICON} />}
          label={t('student.documents.chat.fields.title', { defaultValue: 'Titre' })}
        >
          <span>{conversation.serviceName}</span>
        </InternshipInspectorRow>
        {conversation.serviceCode ? (
          <InternshipInspectorRow
            icon={<Tag {...ICON} />}
            label={t('student.documents.chat.fields.code', { defaultValue: 'Code' })}
          >
            <span>{conversation.serviceCode}</span>
          </InternshipInspectorRow>
        ) : null}
        {conversation.category ? (
          <InternshipInspectorRow
            icon={<Tag {...ICON} />}
            label={t('student.documents.chat.fields.category', { defaultValue: 'Catégorie' })}
          >
            <span>{conversation.category}</span>
          </InternshipInspectorRow>
        ) : null}
        <InternshipInspectorRow
          icon={<Clock {...ICON} />}
          label={t('student.documents.chat.fields.sla', { defaultValue: 'Délai SLA' })}
        >
          <span>
            {t('student.documents.detail.processing.slaValue', {
              defaultValue: '{{hours}} h',
              hours: conversation.slaHours,
            })}
          </span>
        </InternshipInspectorRow>
      </div>

      <div className="isi-inspector-divider" />

      <div className="isi-inspector-actions">
        <span className="isi-inspector-actions-title">
          {t('student.documents.chat.sections.quickActions', { defaultValue: 'Actions rapides' })}
        </span>
        <button
          type="button"
          className="isi-inspector-action isi-inspector-action--primary"
          onClick={onViewService}
          disabled={!conversation.serviceId}
        >
          <span className="isi-inspector-action-icon">
            <ExternalLink {...ICON} />
          </span>
          <span className="isi-inspector-action-text">
            {t('student.documents.chat.viewService', { defaultValue: 'Voir le document' })}
          </span>
          <ChevronRight className="isi-inspector-action-chevron size-4" strokeWidth={2.25} />
        </button>
      </div>
    </aside>
  );
};

export default StudentDocumentContextPanel;
