import { FunctionComponent, ReactNode } from 'react';

type Props = {
  label: string;
  children: ReactNode;
  disabled?: boolean;
};

const ChatComposerTooltip: FunctionComponent<Props> = ({ label, children, disabled = false }) => {
  const trimmed = label.trim();
  if (!trimmed || disabled) return <>{children}</>;

  return (
    <span className="chat-composer-tooltip" data-tooltip={trimmed} title={trimmed}>
      {children}
    </span>
  );
};

export default ChatComposerTooltip;
