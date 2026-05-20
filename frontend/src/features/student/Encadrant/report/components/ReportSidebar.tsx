import type { ReportSectionItem } from '../types';
import type { ReportProgressData } from '../types';
import ReportSectionsCard from './ReportSectionsCard';
import ReportProgressCard from './ReportProgressCard';
import ReportAiAssistantCard from './ReportAiAssistantCard';

interface ReportSidebarProps {
  sections: ReportSectionItem[];
  progress: ReportProgressData;
  activeSectionId: string;
  onSelectSection: (id: string) => void;
}

export default function ReportSidebar({
  sections,
  progress,
  activeSectionId,
  onSelectSection,
}: ReportSidebarProps) {
  return (
    <aside className="flex w-full min-w-0 flex-col gap-4">
      <ReportSectionsCard
        sections={sections}
        activeSectionId={activeSectionId}
        onSelectSection={onSelectSection}
      />
      <ReportProgressCard progress={progress} />
      <ReportAiAssistantCard />
    </aside>
  );
}
