import { Server as SocketIOServer, Socket } from 'socket.io';

export const registerDocumentSocket = (io: SocketIOServer) => {
  io.on('connection', (socket: Socket) => {
    // eslint-disable-next-line no-console
    console.log(`[socket]: connected ${socket.id}`);

    socket.on('document:join', (documentId: string) => {
      socket.join(`document:${documentId}`);
    });

    socket.on('document:update', (payload: { documentId: string; content: string }) => {
      const room = `document:${payload.documentId}`;
      socket.to(room).emit('document:updated', { content: payload.content });
    });

    socket.on('disconnect', () => {
      // eslint-disable-next-line no-console
      console.log(`[socket]: disconnected ${socket.id}`);
    });
  });
};

export default registerDocumentSocket;


