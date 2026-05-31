import { FunctionComponent } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import {
  STUDENT_TASK_DETAIL_ACTION_BTN,
  STUDENT_TASK_DETAIL_BADGE,
  STUDENT_TASK_DETAIL_ITEM,
  STUDENT_TASK_DETAIL_ITEM_ACTIONS,
  STUDENT_TASK_DETAIL_ITEM_DEADLINE,
  STUDENT_TASK_DETAIL_ITEM_MAIN,
  STUDENT_TASK_DETAIL_ITEM_TITLE,
  STUDENT_TASK_DETAIL_ITEM_TITLE_ROW,
} from '../constants/studentTaskDetailLayout';
import {
  STUDENT_TASK_ITEM_CARD_BG,
  STUDENT_TASK_ITEM_TITLE_DONE,
  STUDENT_TASK_PRIORITY_BADGE,
  STUDENT_TASK_PRIORITY_LABEL,
  STUDENT_TASK_STATUS_BADGE,
  STUDENT_TASK_STATUS_LABEL,
} from '../constants/studentTaskDetailStyles';
import type { StudentTaskItem } from '../types';

interface StudentTaskDetailItemCardProps {
  task: StudentTaskItem;
}

const StudentTaskDetailItemCard: FunctionComponent<StudentTaskDetailItemCardProps> = ({ task }) => {
  const isDone = task.status === 'done';

  return (
    <article className={`${STUDENT_TASK_DETAIL_ITEM} ${STUDENT_TASK_ITEM_CARD_BG[task.status]}`}>
      <div className={STUDENT_TASK_DETAIL_ITEM_MAIN}>
        <div className={STUDENT_TASK_DETAIL_ITEM_TITLE_ROW}>
          <h2
            className={`${STUDENT_TASK_DETAIL_ITEM_TITLE} ${isDone ? STUDENT_TASK_ITEM_TITLE_DONE : ''}`}
          >
            {task.title}
          </h2>
          <span className={`${STUDENT_TASK_DETAIL_BADGE} ${STUDENT_TASK_STATUS_BADGE[task.status]}`}>
            {STUDENT_TASK_STATUS_LABEL[task.status]}
          </span>
          <span className={`${STUDENT_TASK_DETAIL_BADGE} ${STUDENT_TASK_PRIORITY_BADGE[task.priority]}`}>
            {STUDENT_TASK_PRIORITY_LABEL[task.priority]}
          </span>
        </div>
        <p className={STUDENT_TASK_DETAIL_ITEM_DEADLINE}>Deadline: {task.deadline}</p>
      </div>

      <div className={STUDENT_TASK_DETAIL_ITEM_ACTIONS}>
        <button type="button" className={STUDENT_TASK_DETAIL_ACTION_BTN}>
          <Pencil className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
          Edit
        </button>
        <button type="button" className={STUDENT_TASK_DETAIL_ACTION_BTN}>
          <Trash2 className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
          Delete
        </button>
      </div>
    </article>
  );
};

export default StudentTaskDetailItemCard;
