import { Server as SocketIOServer, Socket } from 'socket.io';
import { createClient } from 'redis';
import { WSMessage, WSReaction } from '../types';

const APPID = process.env.APPID || 'default-app-id';
const activeUsers = new Set<number>();
const isProduction = process.env.NODE_ENV === 'production';

// Redis clients
const subscriber = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: isProduction ? { tls: true, rejectUnauthorized: false } : undefined,
});
const publisher = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: isProduction ? { tls: true, rejectUnauthorized: false } : undefined,
});

subscriber.on('error', (err) => console.error('Redis Subscriber Error', err));
publisher.on('error', (err) => console.error('Redis Publisher Error', err));

// Connect to Redis
subscriber.connect();
publisher.connect();

const registerMessagingSocket = (io: SocketIOServer) => {
  // Redis subscription for conversation messages
  subscriber.pSubscribe('conversation:*', (message, channel) => {
    const parsed: (WSMessage | WSReaction) & { senderSocketId?: string } =
      JSON.parse(message);
    const [, conversationId, type] = channel.split(':');

    if (type === 'reaction') {
      // Reactions broadcast to the conversation room
      io.to(conversationId).emit('receive-reaction', parsed as WSReaction);
      return;
    }

    const payload = parsed as WSMessage & { senderSocketId?: string };
    const recipientIds: number[] = Array.isArray(payload.recipientIds)
      ? payload.recipientIds
      : typeof payload.recipientId === 'number'
        ? [payload.recipientId]
        : [];

    if (recipientIds.length === 0) return;

    const onlineRecipientIds = recipientIds.filter((id) => activeUsers.has(id));
    if (onlineRecipientIds.length === 0) return;

    if (payload.senderSocketId) {
      onlineRecipientIds.forEach((rid) => {
        io.to(rid.toString())
          .except(payload.senderSocketId!)
          .emit('receive-message', payload);
      });
    } else {
      onlineRecipientIds.forEach((rid) => {
        io.to(rid.toString()).emit('receive-message', payload);
      });
    }
  });

  io.on('connection', (socket: Socket) => {
    const id = socket.handshake.query.id as string;

    console.log('WELCOME', id, 'to the server', APPID);
    activeUsers.add(parseInt(id));
    socket.join(id);

    io.to(socket.id).emit('online-users', Array.from(activeUsers));
    socket.broadcast.emit('user-connected', parseInt(id));

    // Message handling
    socket.on('send-message', async (payload: WSMessage) => {
      console.log('SENDING TO REDIS:', payload);
      await publisher.publish(
        `conversation:${payload.conversationId}`,
        JSON.stringify({ ...payload, senderSocketId: socket.id }),
      );
    });

    // Reaction handling
    socket.on('react-to-message', async (payload: WSReaction) => {
      await publisher.publish(
        `conversation:${payload.conversationId}:reaction`,
        JSON.stringify({ ...payload, senderSocketId: socket.id }),
      );
    });

    // Conversation room management
    socket.on('join-conversation', (conversationId: string | number) => {
      socket.join(conversationId.toString());
    });

    socket.on('leave-conversation', (conversationId: string | number) => {
      socket.leave(conversationId.toString());
    });

    socket.on('disconnect', () => {
      activeUsers.delete(parseInt(id));
      socket.broadcast.emit('user-disconnected', parseInt(id));
    });
  });
};

export default registerMessagingSocket;
