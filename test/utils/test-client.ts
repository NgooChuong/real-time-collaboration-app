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

export const waitForEvent = <T>(
  socket: Socket,
  event: SocketEvents,
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      console.error(`[TEST] TIMEOUT waiting for event: ${event}`);
      reject(new Error(`Timeout: ${event}`));
    }, 10000);

    socket.once(event, (data) => {
      clearTimeout(timeout);
      console.log(`[TEST] RECEIVED ${event}:`, data);
      resolve(data);
    });
  });
};
