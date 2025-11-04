import { Server as SocketIOServer, Socket } from 'socket.io';
import { activeUsers, addActiveUser, removeActiveUser } from './activeUsers';
import { SocketEvents } from './socket.events';

const registerPresenceSocket = (io: SocketIOServer) => {
  io.on(SocketEvents.CONNECTION, (socket: Socket) => {
    const id = socket.handshake.query.id as string;
    if (!id) return;
  const numericId = Number.parseInt(id, 10);

    console.log('WELCOME', id);
    addActiveUser(numericId);
    socket.join(id);

    // Send current online users to the connected socket
    io.to(socket.id).emit(SocketEvents.ONLINE_USERS, Array.from(activeUsers));
    // Notify others
    socket.broadcast.emit(SocketEvents.USER_CONNECTED, numericId);

    socket.on(SocketEvents.DISCONNECT, () => {
      removeActiveUser(numericId);
      socket.broadcast.emit(SocketEvents.USER_DISCONNECTED, numericId);
    });
  });
};

export default registerPresenceSocket;
