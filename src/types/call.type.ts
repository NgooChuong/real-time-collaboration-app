// === VIDEO CALL TYPES (DỄ HIỂU HƠN) ===
type CallPayload = {
  toUserId: number;
  conversationId: string | number;
};

type CallResponsePayload = {
  fromUserId: number;
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
  fromUserId: number;  // Người chấp nhận
};

type CallRejectedPayload = {
  fromUserId: number;  // Người từ chối
};

type IncomingCallPayload = {
  fromUserId: number;  // Người gọi
  conversationId: string | number;
};

type WebRTCOfferPayload = {
  offer: RTCSessionDescriptionInit;
  fromUserId: number;  // Người gửi offer
  conversationId: string | number;
};

type WebRTCAnswerPayload = {
  answer: RTCSessionDescriptionInit;
  fromUserId: number;  // Người gửi answer
  conversationId: string | number;
};

type WebRTCIcePayload = {
  candidate: RTCIceCandidateInit;
  fromUserId: number;  // Người gửi candidate
  conversationId: string | number;
};

type CallEndedPayload = {
  fromUserId: number;  // Người kết thúc
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
};