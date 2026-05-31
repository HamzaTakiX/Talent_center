import { FunctionComponent, ReactNode, useCallback, useState } from 'react';
import EncadrantHeader from './EncadrantHeader';
import EncadrantSidebar from './EncadrantSidebar';

interface EncadrantLayoutProps {
  children: ReactNode;
  headerTitle?: string;
  headerSubtitle?: string;
}

const EncadrantLayout: FunctionComponent<EncadrantLayoutProps> = ({
  children,
  headerTitle,
  headerSubtitle = 'Encadrant Portal',
}) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#fafafa] font-sans">
      <EncadrantSidebar mobileOpen={mobileNavOpen} onMobileClose={closeMobileNav} />
      <div className="flex min-w-0 flex-1 flex-col bg-[#fafafa]">
        <EncadrantHeader
          onMenuClick={() => setMobileNavOpen(true)}
          title={headerTitle}
          subtitle={headerSubtitle}
        />
        <main className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-5 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default EncadrantLayout;
