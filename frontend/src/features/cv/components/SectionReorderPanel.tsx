import { FunctionComponent } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Eye, EyeOff, GripVertical, Trash2 } from 'lucide-react';

import { CvSection } from '../types';

interface SectionReorderPanelProps {
  sections: CvSection[];
  onReorder: (orderedIds: number[]) => void;
  onToggleVisibility: (sectionId: number, isVisible: boolean) => void;
  onDelete: (sectionId: number) => void;
}

const SectionReorderPanel: FunctionComponent<SectionReorderPanelProps> = ({
  sections,
  onReorder,
  onToggleVisibility,
  onDelete,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const ordered = [...sections].sort((a, b) => a.order_index - b.order_index);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ordered.findIndex((s) => s.id === active.id);
    const newIndex = ordered.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = arrayMove(ordered, oldIndex, newIndex);
    onReorder(next.map((s) => s.id));
  };

  if (ordered.length === 0) {
    return (
      <p className="text-xs text-gray-500 italic">
        No sections yet. Add one above to get started.
      </p>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ordered.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-1">
          {ordered.map((section) => (
            <SortableRow
              key={section.id}
              section={section}
              onToggleVisibility={onToggleVisibility}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

interface SortableRowProps {
  section: CvSection;
  onToggleVisibility: (sectionId: number, isVisible: boolean) => void;
  onDelete: (sectionId: number) => void;
}

const SortableRow: FunctionComponent<SortableRowProps> = ({
  section,
  onToggleVisibility,
  onDelete,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 px-2 py-2 bg-gray-50 rounded border border-gray-200"
    >
      <button
        {...attributes}
        {...listeners}
        className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <span className={`flex-1 text-xs ${section.is_visible ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
        {section.label || section.section_type}
      </span>

      <button
        onClick={() => onToggleVisibility(section.id, !section.is_visible)}
        className="text-gray-400 hover:text-blue-600"
        title={section.is_visible ? 'Hide' : 'Show'}
      >
        {section.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
      </button>

      <button
        onClick={() => onDelete(section.id)}
        className="text-gray-400 hover:text-red-600"
        title="Delete"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default SectionReorderPanel;
