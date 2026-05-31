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
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskRichCard
        task={task}
        onClick={onSelect}
        isDragging={isDragging}
        compact
        dragHandle={
          <button
            type="button"
            className="shrink-0 cursor-grab text-[var(--admin-text-muted)] active:cursor-grabbing"
            {...listeners}
            {...attributes}
            onClick={(e) => e.stopPropagation()}
            aria-label="Drag"
          >
            <GripVertical className="h-4 w-4" />
          </button>
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
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
      onDragStart={(e) => setActiveId(String(e.active.id))}
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
      <DragOverlay>
        {activeTask ? (
          <div className="w-[260px]">
            <TaskRichCard task={activeTask} onClick={() => {}} isDragging compact />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default TaskKanbanBoard;
