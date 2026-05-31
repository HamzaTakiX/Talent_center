import { FunctionComponent, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { ReportSection } from '../../types';

interface ReportStructureSidebarProps {
  sections: ReportSection[];
  activeSectionId: string;
  onSelectSection: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
  open?: boolean;
}

function SortableSectionItem({
  section,
  isActive,
  onSelect,
}: {
  section: ReportSection;
  isActive: boolean;
  onSelect: () => void;
}) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`student-report-section-item ${isActive ? 'is-active' : ''}`}
      onClick={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      role="button"
      tabIndex={0}
    >
      <button
        type="button"
        className="student-report-section-item__drag"
        {...attributes}
        {...listeners}
        aria-label={t('student.reports.editor.reorderSection')}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-[var(--admin-text)]">{section.title}</div>
        <div className="student-report-section-item__meta">
          {t('student.reports.editor.sectionMeta', {
            words: section.wordCount,
            percent: section.completionPercent,
          })}
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[var(--admin-surface-muted)]">
          <div
            className="h-full rounded-full bg-[var(--admin-brand)] transition-all duration-300"
            style={{ width: `${section.completionPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

const ReportStructureSidebar: FunctionComponent<ReportStructureSidebarProps> = ({
  sections,
  activeSectionId,
  onSelectSection,
  onReorder,
  open = true,
}) => {
  const { t } = useTranslation();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const ids = sections.map((s) => s.id);
      const oldIndex = ids.indexOf(String(active.id));
      const newIndex = ids.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;
      const next = [...ids];
      const [removed] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, removed);
      onReorder(next);
    },
    [sections, onReorder],
  );

  return (
    <aside className={`student-report-sidebar ${open ? 'is-open' : ''}`} aria-label={t('student.reports.editor.structure')}>
      <div className="student-report-structure-header">
        <h2 className="student-report-structure-title">{t('student.reports.editor.structure')}</h2>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <nav>
            {sections.map((section) => (
              <SortableSectionItem
                key={section.id}
                section={section}
                isActive={section.id === activeSectionId}
                onSelect={() => onSelectSection(section.id)}
              />
            ))}
          </nav>
        </SortableContext>
      </DndContext>
    </aside>
  );
};

export default ReportStructureSidebar;
