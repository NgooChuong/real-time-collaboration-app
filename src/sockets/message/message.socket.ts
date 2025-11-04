import { publisher } from '../redis.client';
import { activeUsers } from '../activeUsers';
import { Server as SocketIOServer } from 'socket.io';
import { WSMessage, WSReaction } from '../../types';
import { emitReceiveMessage } from './message.event';
export const publishMessage = async (
  conversationId: string | number,
  payload: WSMessage & { senderSocketId: string },
) => {
  await publisher.publish(
    `conversation:${conversationId}`,
    JSON.stringify(payload),
  );
};

export const publishReaction = async (
  conversationId: string | number,
  payload: WSReaction & { senderSocketId: string },
) => {
  await publisher.publish(
    `conversation:${conversationId}:reaction`,
    JSON.stringify(payload),
  );
};

export const handleIncomingMessage = (
  io: SocketIOServer,
  payload: WSMessage & { senderSocketId?: string },
) => {
  let recipientIds: number[] = [];
  if (Array.isArray(payload.recipientIds)) {
    recipientIds = payload.recipientIds;
  } else if (typeof payload.recipientId === 'number') {
    recipientIds = [payload.recipientId];
  }

  if (recipientIds.length === 0) return;

  const onlineRecipientIds = recipientIds.filter((id) => activeUsers.has(id));
  if (onlineRecipientIds.length === 0) return;

  for (const rid of onlineRecipientIds) {
    emitReceiveMessage(io, rid, payload, payload.senderSocketId);
  }
};
