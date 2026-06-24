import type { MessageDto } from '../../../../shared/contextual-chat/types';

export function isPendingLocalMessage(message: MessageDto): boolean {
  const nonce = message.metadata_json?.client_nonce;
  if (typeof nonce === 'string' && nonce.startsWith('local-')) return true;
  return String(message.id).startsWith('local-');
}

export function getMessageStableKey(message: MessageDto): string {
  const nonce = message.metadata_json?.client_nonce;
  if (typeof nonce === 'string' && nonce.trim()) return nonce;
  return String(message.id);
}

function mergeReadStateFromExisting(existing: MessageDto, server: MessageDto): MessageDto {
  if (existing.delivery_status !== 'read' || server.delivery_status === 'read') {
    return server;
  }
  return {
    ...server,
    delivery_status: 'read',
    read_by: existing.read_by?.length ? existing.read_by : server.read_by,
  };
}

export function mergeServerMessages(
  existing: MessageDto[],
  fetched: MessageDto[],
): MessageDto[] {
  const existingById = new Map(existing.map((message) => [message.id, message]));
  const merged = fetched.map((serverMsg) => {
    const prior = existingById.get(serverMsg.id);
    return prior ? mergeReadStateFromExisting(prior, serverMsg) : serverMsg;
  });

  for (const pending of existing.filter(isPendingLocalMessage)) {
    const alreadySaved = fetched.some(
      (serverMsg) =>
        serverMsg.is_own === pending.is_own &&
        serverMsg.body === pending.body &&
        Math.abs(
          new Date(serverMsg.created_at).getTime() - new Date(pending.created_at).getTime(),
        ) < 120_000,
    );
    if (!alreadySaved) {
      merged.push(pending);
    }
  }

  return merged.sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

export function hasPendingOwnMessage(
  messages: MessageDto[],
  body?: string,
): boolean {
  return messages.some(
    (message) =>
      message.is_own &&
      (isPendingLocalMessage(message) || (body ? message.body === body : false)),
  );
}

export function withClientNonce(message: MessageDto, clientNonce: string): MessageDto {
  return {
    ...message,
    metadata_json: {
      ...(message.metadata_json ?? {}),
      client_nonce: clientNonce,
    },
  };
}
