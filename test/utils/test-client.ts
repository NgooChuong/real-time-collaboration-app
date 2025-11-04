// test/utils/test-client.ts
import { io, Socket } from 'socket.io-client';
import { SocketEvents } from '../../src/sockets/socket.events';
export const createTestClient = (userId: number): Socket => {
  return io('http://localhost:3000', {
    query: { id: userId },
    reconnection: false,
    timeout: 5000,
  });
};

export const waitForConnect = (socket: Socket): Promise<void> => {
  return new Promise((resolve, reject) => {
    socket.on('connect', () => resolve());
    socket.on('connect_error', (err) => reject(err));
  });
};

export const waitForEvent = <T = unknown>(
  socket: Socket,
  event: SocketEvents
): Promise<T> => {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
};