import { FunctionComponent, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { KANBAN_COLUMNS } from '../constants/taskCategories';
import type { StudentPlatformTask, TaskStatus } from '../types';
import TaskRichCard from './TaskRichCard';

interface TaskKanbanBoardProps {
  tasks: StudentPlatformTask[];
  onSelectTask: (id: string) => void;
  onMoveTask: (taskId: string, status: TaskStatus) => void;
  loading?: boolean;
}

const KanbanColumn: FunctionComponent<{
  status: TaskStatus;
  tasks: StudentPlatformTask[];
  onSelectTask: (id: string) => void;
}> = ({ status, tasks, onSelectTask }) => {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div ref={setNodeRef} className={`student-task-kanban-col ${isOver ? 'is-over' : ''}`}>
      <div className="student-task-kanban-col__head">
        <span className="text-xs font-bold uppercase tracking-wide text-[var(--admin-text)]">
          {t(`student.encadrant.task.platform.kanban.${status}`)}
        </span>
        <span className="admin-badge admin-badge--neutral">{tasks.length}</span>
      </div>
      <div className="student-task-kanban-col__body">
        {tasks.map((task) => (
          <DraggableTaskCard key={task.id} task={task} onSelect={() => onSelectTask(task.id)} />
        ))}
      </div>
    </div>
  );
};

const DraggableTaskCard: FunctionComponent<{
  task: StudentPlatformTask;
  onSelect: () => void;
}> = ({ task, onSelect }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style = {
    // DragOverlay renders the moving card; keep the source as a static placeholder.
    transform: isDragging ? undefined : CSS.Translate.toString(transform),
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="student-task-kanban-draggable"
      {...listeners}
      {...attributes}
    >
      <TaskRichCard
        task={task}
        onClick={onSelect}
        isDragging={isDragging}
        compact
        dragHandle={
          <span className="student-task-card-drag" aria-hidden>
            <GripVertical className="h-4 w-4" />
          </span>
        }
      />
    </div>
  );
};

const TaskKanbanBoard: FunctionComponent<TaskKanbanBoardProps> = ({
  tasks,
  onSelectTask,
  onMoveTask,
  loading,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overlayWidth, setOverlayWidth] = useState<number | undefined>();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const byColumn = useMemo(() => {
    const map: Record<(typeof KANBAN_COLUMNS)[number], StudentPlatformTask[]> = {
      todo: [],
      in_progress: [],
      in_review: [],
      done: [],
    };
    tasks.forEach((task) => {
      if (task.status in map) {
        map[task.status as (typeof KANBAN_COLUMNS)[number]].push(task);
      } else {
        map.todo.push(task);
      }
    });
    return map;
  }, [tasks]);

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    const rect = event.active.rect.current.translated ?? event.active.rect.current.initial;
    setOverlayWidth(rect?.width);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverlayWidth(undefined);
    if (!over) return;
    const taskId = String(active.id);
    let newStatus = String(over.id) as TaskStatus;
    if (!KANBAN_COLUMNS.includes(newStatus as (typeof KANBAN_COLUMNS)[number])) {
      const overTask = tasks.find((t) => t.id === over.id);
      if (!overTask) return;
      newStatus = overTask.status;
    }
    onMoveTask(taskId, newStatus);
  };

  if (loading) {
    return (
      <div className="p-5">
        <div className="student-task-skeleton h-64 w-full" />
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragCancel={() => {
        setActiveId(null);
        setOverlayWidth(undefined);
      }}
      onDragEnd={handleDragEnd}
    >
      <div className="student-task-kanban">
        {KANBAN_COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={byColumn[status]}
            onSelectTask={onSelectTask}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div
            className="student-task-kanban-overlay"
            style={overlayWidth ? { width: overlayWidth } : undefined}
          >
            <TaskRichCard task={activeTask} onClick={() => {}} compact lifted />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default TaskKanbanBoard;
