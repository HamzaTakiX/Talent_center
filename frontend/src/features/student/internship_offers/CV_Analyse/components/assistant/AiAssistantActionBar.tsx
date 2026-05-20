import { FunctionComponent } from 'react';
import { Pencil } from 'lucide-react';
import {
  CV_ASSISTANT_BTN_OUTLINE_PURPLE,
  CV_ASSISTANT_BTN_SECONDARY,
} from '../../constants/cvAiAssistantStyles';
import { CV_ASSISTANT_ACTIONS_ROW } from '../../constants/cvAiAssistantLayout';

const AiAssistantActionBar: FunctionComponent = () => {
  return (
    <div className={CV_ASSISTANT_ACTIONS_ROW}>
      <button type="button" className={CV_ASSISTANT_BTN_SECONDARY}>
        Cancel
      </button>
      <button type="button" className={CV_ASSISTANT_BTN_OUTLINE_PURPLE}>
        <Pencil className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
        Edit My CV
      </button>
    </div>
  );
};

export default AiAssistantActionBar;
