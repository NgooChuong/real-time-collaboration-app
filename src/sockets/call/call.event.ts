import { Server as SocketIOServer, Socket } from 'socket.io';
import { SocketEvents } from '../socket.events';
import {
  CallAcceptedPayload,
  CallEndedPayload,
  CallErrorPayload,
  CallRejectedPayload,
  IncomingCallPayload,
  WebRTCAnswerPayload,
  WebRTCIcePayload,
  WebRTCOfferPayload,
} from 'types/call.type';

const emitCallError = (socket: Socket, error: string) => {
  socket.emit(SocketEvents.CALL_ERROR, { error } satisfies CallErrorPayload);
};

const emitIncomingCall = (
  io: SocketIOServer,
  toUserId: number,
  payload: IncomingCallPayload
) => {
  io.to(toUserId.toString()).emit(SocketEvents.INCOMING_CALL, payload);
};

const emitCallAccepted = (
  io: SocketIOServer,
  toUserId: number,
  payload: CallAcceptedPayload
) => {
  io.to(toUserId.toString()).emit(SocketEvents.CALL_ACCEPTED, payload);
};

const emitCallRejected = (
  io: SocketIOServer,
  toUserId: number,
  payload: CallRejectedPayload
) => {
  io.to(toUserId.toString()).emit(SocketEvents.CALL_REJECTED, payload);
};

const emitWebRTCOffer = (
  io: SocketIOServer,
  toUserId: number,
  payload: WebRTCOfferPayload
) => {
  io.to(toUserId.toString()).emit(SocketEvents.WEBRTC_OFFER, payload);
};

const emitWebRTCAnswer = (
  io: SocketIOServer,
  toUserId: number,
  payload: WebRTCAnswerPayload
) => {
  io.to(toUserId.toString()).emit(SocketEvents.WEBRTC_ANSWER, payload);
};

const emitWebRTCIce = (
  io: SocketIOServer,
  toUserId: number,
  payload: WebRTCIcePayload
) => {
  io.to(toUserId.toString()).emit(SocketEvents.WEBRTC_ICE, payload);
};

const emitCallEnded = (
  io: SocketIOServer,
  toUserId: number,
  payload: CallEndedPayload
) => {
  io.to(toUserId.toString()).emit(SocketEvents.CALL_ENDED, payload);
};

export {
  emitCallError,
  emitIncomingCall,
  emitCallAccepted,
  emitCallRejected,
  emitWebRTCOffer,
  emitWebRTCAnswer,
  emitWebRTCIce,
  emitCallEnded,
};