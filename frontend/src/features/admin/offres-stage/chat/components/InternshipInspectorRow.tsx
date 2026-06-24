import { FunctionComponent, type ReactNode } from 'react';

type Props = {
  icon: ReactNode;
  label: string;
  children: ReactNode;
};

const InternshipInspectorRow: FunctionComponent<Props> = ({ icon, label, children }) => (
  <div className="isi-inspector-row">
    <div className="isi-inspector-row-icon" aria-hidden>
      {icon}
    </div>
    <div className="isi-inspector-row-content">
      <span className="isi-inspector-row-label">{label}</span>
      <div className="isi-inspector-row-value">{children}</div>
    </div>
  </div>
);

export default InternshipInspectorRow;
