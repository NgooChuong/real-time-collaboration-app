import { Server as SocketIOServer, Socket } from 'socket.io';
import { subscriber } from '../redis.client';
import { SocketEvents } from '../socket.events';
import { WSMessage, WSReaction } from '../../types';
import { emitReceiveReaction } from './message.event';
import {
  handleIncomingMessage,
  publishMessage,
  publishReaction,
} from './message.socket';

const registerMessagingSocket = (io: SocketIOServer) => {
  // Redis subscription for conversation messages
  subscriber.pSubscribe('conversation:*', (message, channel) => {
    const parsed: (WSMessage | WSReaction) & { senderSocketId?: string } =
      JSON.parse(message);
    const [, conversationId, type] = channel.split(':');

    if (type === 'reaction') {
      emitReceiveReaction(io, conversationId, parsed as WSReaction);
      return;
    }

    handleIncomingMessage(
      io,
      parsed as WSMessage & { senderSocketId?: string },
    );
  });

  io.on(SocketEvents.CONNECTION, (socket: Socket) => {
    // Message handling
    socket.on(SocketEvents.SEND_MESSAGE, async (payload: WSMessage) => {
      console.log('SENDING TO REDIS:', payload);
      await publishMessage(payload.conversationId, {
        ...payload,
        senderSocketId: socket.id,
      });
    });

    // Reaction handling
    socket.on(SocketEvents.REACT_TO_MESSAGE, async (payload: WSReaction) => {
      await publishReaction(payload.conversationId, {
        ...payload,
        senderSocketId: socket.id,
      });
    });

    // Conversation room management
    socket.on(
      SocketEvents.JOIN_CONVERSATION,
      (conversationId: string | number) => {
        socket.join(conversationId.toString());
      },
    );

    socket.on(
      SocketEvents.LEAVE_CONVERSATION,
      (conversationId: string | number) => {
        socket.leave(conversationId.toString());
      },
    );
  });
};

export default registerMessagingSocket;
