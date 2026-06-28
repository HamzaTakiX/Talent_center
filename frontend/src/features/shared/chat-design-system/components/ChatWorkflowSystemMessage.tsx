import { FunctionComponent } from 'react';

type Props = {
  label: string;
  createdAt?: string;
};

function formatWorkflowTimestamp(iso?: string): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const day = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(date);
  const time = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
  return `${day} • ${time}`;
}

const ChatWorkflowSystemMessage: FunctionComponent<Props> = ({ label, createdAt }) => {
  const stamp = formatWorkflowTimestamp(createdAt);

  return (
    <div className="isi-system-msg isi-system-msg--workflow" role="status">
      <div className="isi-system-msg__rule" aria-hidden="true" />
      <p className="isi-system-msg__label">✓ {label}</p>
      {stamp ? (
        <time className="isi-system-msg__time" dateTime={createdAt}>
          {stamp}
        </time>
      ) : null}
      <div className="isi-system-msg__rule" aria-hidden="true" />
    </div>
  );
};

export default ChatWorkflowSystemMessage;
