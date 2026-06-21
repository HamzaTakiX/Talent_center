import { FunctionComponent, ReactNode, type ComponentType } from 'react';
import AdminLayout from '../../../dashboard/components/AdminLayout';
import type { SupportMobileView } from '../types/supportInboxTypes';

export type SupportInboxLayoutProps = {
  children: ReactNode;
  mainFillHeight?: boolean;
};

interface Props {
  hasSelection: boolean;
  mobileView: SupportMobileView;
  sidebar: ReactNode;
  workspace: ReactNode;
  contextPanel?: ReactNode;
  overlays?: ReactNode;
  Layout?: ComponentType<SupportInboxLayoutProps>;
}

const SupportInboxShell: FunctionComponent<Props> = ({
  hasSelection,
  mobileView,
  sidebar,
  workspace,
  contextPanel,
  overlays,
  Layout = AdminLayout,
}) => {
  const layoutClass =
    mobileView === 'chat' ? 'isi-layout--mobile-chat' : 'isi-layout--mobile-list';

  return (
    <Layout mainFillHeight>
      <div
        className={`isi-shell ${layoutClass} ${hasSelection ? 'isi-shell--has-selection' : ''}`}
      >
        {sidebar}
        {workspace}
        {contextPanel}
        {overlays}
      </div>
    </Layout>
  );
};

export default SupportInboxShell;
