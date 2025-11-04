import { Server as SocketIOServer } from 'socket.io';
import registerPresenceSocket from './presence.socket';
import registerMessagingSocket from './message/register.message.socket';
import { registerVideoCallEvents } from './call/register.call.socket';

const registerSockets = (io: SocketIOServer) => {
  // Register different socket responsibilities from separate modules
  registerVideoCallEvents(io);
  registerPresenceSocket(io);
  registerMessagingSocket(io);
};

export default registerSockets;
