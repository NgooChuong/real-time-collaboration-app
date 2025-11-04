export enum SocketEvents {
  CONNECTION = 'connection',
  DISCONNECT = 'disconnect',
  // Message related events
  SEND_MESSAGE = 'send-message',
  RECEIVE_MESSAGE = 'receive-message',
  REACT_TO_MESSAGE = 'react-to-message',
  RECEIVE_REACTION = 'receive-reaction',
  JOIN_CONVERSATION = 'join-conversation',
  LEAVE_CONVERSATION = 'leave-conversation',
  ONLINE_USERS = 'online-users',
  USER_CONNECTED = 'user-connected',
  USER_DISCONNECTED = 'user-disconnected',

  // Call related events
 // Call flow
  CALL_START = 'call-start',           // Client → Server
  INCOMING_CALL = 'incoming-call',     // Server → Callee
  CALL_ACCEPT = 'call-accept',         // Client → Server (giữ lại, vì client cần gửi)
  CALL_ACCEPTED = 'call-accepted',     // Server → Caller
  CALL_REJECT = 'call-reject',         // Client → Server
  CALL_REJECTED = 'call-rejected',     // Server → Caller
  CALL_END = 'call-end',               // Client → Server
  CALL_ENDED = 'call-ended',           // Server → Other
  CALL_ERROR = 'call-error',           // Server → Client

  // WebRTC
  WEBRTC_OFFER = 'webrtc-offer',       // Bidirectional
  WEBRTC_ANSWER = 'webrtc-answer',     // Bidirectional
  WEBRTC_ICE = 'webrtc-ice',           // Bidirectional
}

export default SocketEvents;
