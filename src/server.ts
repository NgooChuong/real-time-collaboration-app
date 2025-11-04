import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import registerMessagingSocket from './sockets/socket';
import { allowedOrigins } from './config/allowedOrigins';
import { createApp } from './app';

const port = Number(process.env.PORT) || 3000;

// Initialize database connection
const initializeServer = async () => {
  try {
    const app = createApp();
    const server = http.createServer(app);

    // Initialize Socket.IO with proper CORS configuration
    const io = new SocketIOServer(server, {
      cors: {
        origin: allowedOrigins,
        credentials: true,
      },
    });

    // Register socket handlers
    registerMessagingSocket(io);
    server.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('[server]: Failed to initialize server:', error);
    process.exit(1);
  }
};

// Start the server
initializeServer();
