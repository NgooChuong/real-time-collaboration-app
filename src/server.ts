import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import createApp from './app';
import registerDocumentSocket from './sockets/document.socket';

const port = Number(process.env.PORT) || 3000;

const app = createApp();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
  },
});

// Register sockets
registerDocumentSocket(io);

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[server]: Server is running at http://localhost:${port}`);
});


