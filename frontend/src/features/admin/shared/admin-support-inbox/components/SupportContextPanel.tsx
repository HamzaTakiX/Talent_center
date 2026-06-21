import { FunctionComponent, ReactNode } from 'react';

interface Props {
  title: string;
  badge?: ReactNode;
  children: ReactNode;
}

const SupportContextPanel: FunctionComponent<Props> = ({ title, badge, children }) => (
  <aside className="isi-inspector">
    <header className="isi-inspector-head">
      <span className="isi-inspector-head-title">{title}</span>
      {badge}
    </header>
    <div className="isi-inspector-fields">{children}</div>
  </aside>
);

export default SupportContextPanel;
