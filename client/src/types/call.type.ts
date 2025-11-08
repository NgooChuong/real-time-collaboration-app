// === VIDEO CALL TYPES (DỄ HIỂU HƠN) ===
type CallPayload = {
  toUserId: number;
  conversationId: string | number;
};

type CallResponsePayload = {
  toUserId: number; // ID của người gọi ban đầu để gửi phản hồi về
  conversationId?: string | number;
};

type WebRTCPayload = {
  toUserId: number;
  conversationId: string | number;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
};

type CallErrorPayload = {
  error: string;
};

type CallAcceptedPayload = {
  fromUserId: number; // Người chấp nhận
};

type CallRejectedPayload = {
  fromUserId: number; // Người từ chối
};

type IncomingCallPayload = {
  fromUserId: number; // Người gọi
  conversationId: string | number;
};

type WebRTCOfferPayload = {
  offer: RTCSessionDescriptionInit;
  fromUserId: number; // Người gửi offer
  conversationId: string | number;
};

type WebRTCAnswerPayload = {
  answer: RTCSessionDescriptionInit;
  fromUserId: number; // Người gửi answer
  conversationId: string | number;
};

type WebRTCIcePayload = {
  candidate: RTCIceCandidateInit;
  fromUserId: number; // Người gửi candidate
  conversationId: string | number;
};

type CallEndedPayload = {
  fromUserId: number; // Người kết thúc
};
type WebRTCOfferEmit = {
  toUserId: number;
  offer: RTCSessionDescriptionInit;
  conversationId: string | number;
};

type WebRTCAnswerEmit = {
  toUserId: number;
  answer: RTCSessionDescriptionInit;
  conversationId: string | number;
};

type WebRTCIceEmit = {
  toUserId: number;
  candidate: RTCIceCandidateInit;
  conversationId: string | number;
};
export type {
  CallPayload,
  CallResponsePayload,
  WebRTCPayload,
  CallErrorPayload,
  CallAcceptedPayload,
  CallRejectedPayload,
  IncomingCallPayload,
  WebRTCOfferPayload,
  WebRTCAnswerPayload,
  WebRTCIcePayload,
  CallEndedPayload,
  WebRTCOfferEmit,
  WebRTCAnswerEmit,
  WebRTCIceEmit,
};
