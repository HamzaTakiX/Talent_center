import { FunctionComponent } from 'react';
import { Archive, MessageSquare } from 'lucide-react';

type Props = {
  title: string;
  description: string;
  variant?: 'default' | 'archived';
};

const InternshipSidebarEmptyState: FunctionComponent<Props> = ({
  title,
  description,
  variant = 'default',
}) => {
  const Icon = variant === 'archived' ? Archive : MessageSquare;

  return (
    <div className="isi-conv-empty isi-conv-empty--modern">
      <div className="isi-conv-empty-icon-wrap" aria-hidden>
        <span className="isi-conv-empty-glow" />
        <span className="isi-conv-empty-ring" />
        <span className="isi-conv-empty-orbit">
          <span className="isi-conv-empty-dot isi-conv-empty-dot--1" />
          <span className="isi-conv-empty-dot isi-conv-empty-dot--2" />
        </span>
        <span className="isi-conv-empty-icon-shell">
          <Icon className="isi-conv-empty-icon" strokeWidth={2} />
        </span>
      </div>
      <p className="isi-conv-empty-title">{title}</p>
      <p className="isi-conv-empty-desc">{description}</p>
    </div>
  );
};

export default InternshipSidebarEmptyState;
