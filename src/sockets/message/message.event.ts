import { Server as SocketIOServer } from 'socket.io';
import { WSMessage, WSReaction } from '../../types';
import { SocketEvents } from '../socket.events';

export const emitReceiveMessage = (
  io: SocketIOServer,
  recipientId: number,
  payload: WSMessage,
  senderSocketId?: string,
) => {
  if (senderSocketId) {
    io.to(recipientId.toString())
      .except(senderSocketId)
      .emit(SocketEvents.RECEIVE_MESSAGE, payload);
  } else {
    io.to(recipientId.toString()).emit(SocketEvents.RECEIVE_MESSAGE, payload);
  }
};

export const emitReceiveReaction = (
  io: SocketIOServer,
  conversationId: string | number,
  payload: WSReaction,
) => {
  io.to(conversationId.toString()).emit(SocketEvents.RECEIVE_REACTION, payload);
};
