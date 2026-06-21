import { FunctionComponent } from 'react';
import { CHAR_COUNT_CLASS } from '../classes';

interface CharCountProps {
  current: number;
  max: number;
  id?: string;
}

const CharCount: FunctionComponent<CharCountProps> = ({ current, max, id }) => {
  const ratio = current / max;
  const stateClass =
    current > max ? 'safe-char-count--over' : ratio >= 0.9 ? 'safe-char-count--warn' : '';

  return (
    <p
      id={id}
      className={`safe-char-count ${CHAR_COUNT_CLASS} ${stateClass}`.trim()}
      aria-live="polite"
      aria-atomic="true"
    >
      {current} / {max}
    </p>
  );
};

export default CharCount;
