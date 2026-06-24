import { Fragment, type ReactNode } from 'react';

const BULLET_PATTERN = /^(?:[-•*]|\u2705|\u2713|\u2611\ufe0f?)\s*(.+)$/;
const NUMBERED_PATTERN = /^\d+[.)]\s+(.+)$/;

function parseInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const boldPattern = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = boldPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        <Fragment key={`t-${key++}`}>{text.slice(lastIndex, match.index).replace(/\*\*/g, '')}</Fragment>,
      );
    }
    nodes.push(<strong key={`b-${key++}`}>{match[1]}</strong>);
    lastIndex = boldPattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(<Fragment key={`t-${key++}`}>{text.slice(lastIndex).replace(/\*\*/g, '')}</Fragment>);
  }

  return nodes.length > 0 ? nodes : [text.replace(/\*\*/g, '')];
}

function normalizeListLine(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const bullet = trimmed.match(BULLET_PATTERN);
  if (bullet) return bullet[1];

  const numbered = trimmed.match(NUMBERED_PATTERN);
  if (numbered) return numbered[1];

  return null;
}

export function formatCoachMessage(text: string): ReactNode {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let listItems: string[] = [];
  let blockKey = 0;

  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push(
      <ul key={`list-${blockKey++}`} className="sr-acc-msg__list m-0">
        {listItems.map((item, index) => (
          <li key={`li-${index}`}>{parseInline(item)}</li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  for (const line of lines) {
    const listLine = normalizeListLine(line);
    if (listLine !== null) {
      listItems.push(listLine);
      continue;
    }

    flushList();
    const trimmed = line.trim();
    if (!trimmed) continue;

    blocks.push(
      <p key={`p-${blockKey++}`} className="sr-acc-msg__paragraph m-0">
        {parseInline(trimmed)}
      </p>,
    );
  }

  flushList();

  if (blocks.length === 0) {
    return <p className="m-0 whitespace-pre-wrap">{text.replace(/\*\*/g, '')}</p>;
  }

  return <div className="sr-acc-msg__formatted">{blocks}</div>;
}
