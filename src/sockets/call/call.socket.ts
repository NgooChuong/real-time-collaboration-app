import { Server as SocketIOServer, Socket } from 'socket.io';
import { CallPayload, CallResponsePayload, WebRTCPayload } from 'types/call.type';
import {
  emitCallAccepted,
  emitCallEnded,
  emitCallError,
  emitCallRejected,
  emitIncomingCall,
  emitWebRTCAnswer,
  emitWebRTCIce,
  emitWebRTCOffer,
} from './call.event';
import { activeUsers } from 'sockets/activeUsers';

const handleCallStart = (socket: Socket, io: SocketIOServer, id: string, data: CallPayload) => {
  const { toUserId, conversationId } = data;
  const room = conversationId.toString();
  const fromUserId = parseInt(id);

  if (!activeUsers.has(toUserId)) {
    return emitCallError(socket, 'User offline');
  }

  if (!socket.rooms.has(room)) {
    return emitCallError(socket, 'Not in same conversation');
  }

  emitIncomingCall(io, toUserId, { fromUserId, conversationId });
};

const handleCallAccept = (io: SocketIOServer, id: string, data: CallResponsePayload) => {
  const fromUserId = parseInt(id);
  emitCallAccepted(io, data.fromUserId, { fromUserId });
};

const handleCallReject = (io: SocketIOServer, id: string, data: { fromUserId: number }) => {
  const fromUserId = parseInt(id);
  emitCallRejected(io, data.fromUserId, { fromUserId });
};

const handleWebRTCOffer = (io: SocketIOServer, id: string, data: WebRTCPayload) => {
  const fromUserId = parseInt(id);
  if (!data.offer) return;

  emitWebRTCOffer(io, data.toUserId, {
    offer: data.offer,
    fromUserId,
    conversationId: data.conversationId,
  });
};

const handleWebRTCAnswer = (io: SocketIOServer, id: string, data: WebRTCPayload) => {
  const fromUserId = parseInt(id);
  if (!data.answer) return;

  emitWebRTCAnswer(io, data.toUserId, {
    answer: data.answer,
    fromUserId,
    conversationId: data.conversationId,
  });
};

const handleWebRTCIce = (io: SocketIOServer, id: string, data: WebRTCPayload) => {
  const fromUserId = parseInt(id);
  if (!data.candidate) return;

  emitWebRTCIce(io, data.toUserId, {
    candidate: data.candidate,
    fromUserId,
    conversationId: data.conversationId,
  });
};

const handleCallEnd = (io: SocketIOServer, id: string, data: { toUserId: number; conversationId: string | number }) => {
  const fromUserId = parseInt(id);
  emitCallEnded(io, data.toUserId, { fromUserId });
};

export {
  handleCallStart,
  handleCallAccept,
  handleCallReject,
  handleWebRTCOffer,
  handleWebRTCAnswer,
  handleWebRTCIce,
  handleCallEnd,
};