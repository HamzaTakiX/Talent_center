import { WHITEBOARD_STORAGE_KEY } from '../data/whiteboardMock';

/** Board served by the legacy `/workspace/whiteboard` routes, kept on the original key. */
export const DEFAULT_WHITEBOARD_BOARD_ID = 'default';

const BOARD_ID_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
const BOARD_ID_LENGTH = 10;

export function createWorkspaceBoardId(): string {
  const crypto = globalThis.crypto;
  if (crypto?.randomUUID) return crypto.randomUUID().replace(/-/g, '').slice(0, BOARD_ID_LENGTH);
  let id = '';
  for (let i = 0; i < BOARD_ID_LENGTH; i += 1) {
    id += BOARD_ID_ALPHABET[Math.floor(Math.random() * BOARD_ID_ALPHABET.length)];
  }
  return id;
}

export function normalizeWorkspaceBoardId(rawBoardId: string | undefined): string {
  const cleaned = rawBoardId?.trim().toLowerCase().replace(/[^a-z0-9-]/g, '') ?? '';
  return cleaned.length > 0 ? cleaned.slice(0, 64) : DEFAULT_WHITEBOARD_BOARD_ID;
}

export function whiteboardStorageKey(boardId: string): string {
  return boardId === DEFAULT_WHITEBOARD_BOARD_ID
    ? WHITEBOARD_STORAGE_KEY
    : `${WHITEBOARD_STORAGE_KEY}:${boardId}`;
}
