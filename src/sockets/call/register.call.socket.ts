import { Server as SocketIOServer, Socket } from 'socket.io';
import SocketEvents from 'sockets/socket.events';
import { handleCallAccept, handleCallEnd, handleCallReject, handleCallStart, handleWebRTCAnswer, handleWebRTCIce, handleWebRTCOffer } from './call.socket';


/**
 * Đăng ký tất cả event liên quan đến Video Call
 * Dùng SocketEvents enum → không sai chính tả
 */

export const registerVideoCallEvents = (io: SocketIOServer) => {
  // LẤY socket KHI CLIENT KẾT NỐI
  io.on(SocketEvents.CONNECTION, (socket: Socket) => {
    const id = socket.handshake.query.id as string;
    console.log(`[SOCKET] User ${id} connected: ${socket.id}`);

    // === CALL FLOW ===
    socket.on(SocketEvents.CALL_START, (data) =>
      handleCallStart(socket, io, id, data)
    );

    socket.on(SocketEvents.CALL_ACCEPT, (data) =>
      handleCallAccept(io, id, data)
    );

    socket.on(SocketEvents.CALL_REJECT, (data) =>
      handleCallReject(io, id, data)
    );

    socket.on(SocketEvents.CALL_END, (data) =>
      handleCallEnd(io, id, data)
    );

    // === WEBRTC SIGNALING ===
    socket.on(SocketEvents.WEBRTC_OFFER, (data) =>
      handleWebRTCOffer(io, id, data)
    );

    socket.on(SocketEvents.WEBRTC_ANSWER, (data) =>
      handleWebRTCAnswer(io, id, data)
    );

    socket.on(SocketEvents.WEBRTC_ICE, (data) =>
      handleWebRTCIce(io, id, data)
    );

    // XỬ LÝ NGẮT KẾT NỐI
    socket.on(SocketEvents.DISCONNECT, () => {
      console.log(`[SOCKET] User ${id} disconnected: ${socket.id}`);
    });
  });
};