// hooks/useCall.ts
import { useCallback, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  CallAcceptedPayload,
  IncomingCallPayload,
  WebRTCOfferPayload,
  WebRTCAnswerPayload,
  WebRTCIcePayload,
  WebRTCIceEmit,
  WebRTCOfferEmit,
  WebRTCAnswerEmit,
} from '../types/call.type';
import SocketEvents from '../constants/socket.events';

// STUN + TURN (Numb.vn - miễn phí, nhanh)
const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  {
    urls: 'turn:turn.numb.vn:3478',
    username: 'webrtc',
    credential: 'webrtc123',
  },
  {
    urls: 'turn:turn.numb.vn:3478?transport=tcp',
    username: 'webrtc',
    credential: 'webrtc123',
  },
];

interface UseCallProps {
  currentUserId: number;
  recipientIds: number[];
  conversationId: string;
}

// === ĐỊNH NGHĨA TYPE CHO ICE CANDIDATE ===
interface IceCandidateEvent {
  candidate: RTCIceCandidate | null;
}

export const useCall = ({
  currentUserId,
  recipientIds,
  conversationId,
}: UseCallProps) => {
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);

  // === KẾT NỐI SOCKET ===
  const connectSocket = useCallback(() => {
    if (socketRef.current?.connected) return;

    const socket = io('http://localhost:3000', {
      query: { id: currentUserId },
      transports: ['websocket'],
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[useCall] Socket connected:', socket.id);
    });

    // === CALL_ACCEPTED → TẠO OFFER ===
    socket.on(SocketEvents.CALL_ACCEPTED, async (data: CallAcceptedPayload) => {
      console.log('[useCall] Call accepted by:', data.fromUserId);
      setIsInCall(true);

      if (!pcRef.current) return;

      try {
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);

        recipientIds.forEach((recipientId) => {
          socket.emit(SocketEvents.WEBRTC_OFFER, {
            toUserId: recipientId,
            offer,
            conversationId,
          } satisfies WebRTCOfferEmit);
        });
      } catch (err) {
        console.error('Failed to create offer:', err);
      }
    });

    // === NHẬN OFFER → TRẢ ANSWER ===
    socket.on(SocketEvents.WEBRTC_OFFER, async (data: WebRTCOfferPayload) => {
      if (!pcRef.current) return;

      try {
        await pcRef.current.setRemoteDescription(data.offer);
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);

        socket.emit(SocketEvents.WEBRTC_ANSWER, {
          toUserId: data.fromUserId,
          answer,
          conversationId: data.conversationId,
        } satisfies WebRTCAnswerEmit);
      } catch (err) {
        console.error('Failed to handle offer:', err);
      }
    });

    // === NHẬN ANSWER ===
    socket.on(SocketEvents.WEBRTC_ANSWER, async (data: WebRTCAnswerPayload) => {
      if (!pcRef.current) return;
      await pcRef.current.setRemoteDescription(data.answer);
    });

    // === NHẬN ICE CANDIDATE ===
    socket.on(SocketEvents.WEBRTC_ICE, (data: WebRTCIcePayload) => {
      if (!pcRef.current || !data.candidate) return;
      pcRef.current.addIceCandidate(data.candidate as RTCIceCandidate);
    });

    // === CUỘC GỌI KẾT THÚC ===
    socket.on(SocketEvents.CALL_ENDED, () => {
      endCall();
    });
  }, [currentUserId, recipientIds, conversationId]);

  // === BẮT ĐẦU CUỘC GỌI ===
  const startCall = useCallback(async () => {
    connectSocket();
    setIsCalling(true);

    pcRef.current = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    stream
      .getTracks()
      .forEach((track) => pcRef.current!.addTrack(track, stream));

    // Gửi CALL_START
    recipientIds.forEach((recipientId) => {
      socketRef.current?.emit(SocketEvents.CALL_START, {
        toUserId: recipientId,
        conversationId,
      });
    });

    // === XỬ LÝ ICE ===
    pcRef.current.onicecandidate = (e: IceCandidateEvent) => {
      if (e.candidate) {
        const candidateInit: RTCIceCandidateInit = e.candidate.toJSON();
        recipientIds.forEach((recipientId) => {
          socketRef.current?.emit(SocketEvents.WEBRTC_ICE, {
            toUserId: recipientId,
            candidate: candidateInit,
            conversationId,
          } satisfies WebRTCIceEmit);
        });
      }
    };

    // === NHẬN STREAM ===
    pcRef.current.ontrack = (e: RTCTrackEvent) => {
      const streams = [...e.streams]; // tạo mảng mới → không readonly

      setRemoteStreams((prev) => {
        const newStream = streams[0];
        if (!newStream) return prev;

        const exists = prev.some((s) => s.id === newStream.id);
        return exists ? prev : [...prev, newStream];
      });
    };
  }, [currentUserId, recipientIds, conversationId, connectSocket]);

  // === CHẤP NHẬN CUỘC GỌI ===
  const acceptCall = useCallback(() => {
    if (!socketRef.current) return;

    pcRef.current = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    socketRef.current.emit(SocketEvents.CALL_ACCEPT, {
      fromUserId: currentUserId,
      conversationId,
    });

    setIsInCall(true);
  }, [currentUserId, conversationId]);

  // === KẾT THÚC CUỘC GỌI ===
  const endCall = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;

    recipientIds.forEach((recipientId) => {
      socketRef.current?.emit(SocketEvents.CALL_END, {
        toUserId: recipientId,
        conversationId,
      });
    });

    setIsCalling(false);
    setIsInCall(false);
    setRemoteStreams([]);
  }, [recipientIds, conversationId]);

  // === LẮNG NGHE INCOMING CALL ===
  const onIncomingCall = useCallback(
    (callback: (data: IncomingCallPayload) => void) => {
      socketRef.current?.on(SocketEvents.INCOMING_CALL, callback);
    },
    [],
  );

  return {
    startCall,
    acceptCall,
    endCall,
    onIncomingCall,
    isCalling,
    isInCall,
    remoteStreams,
    localStream:
      pcRef.current
        ?.getSenders()
        .map((s) => s.track)
        .filter((track): track is MediaStreamTrack => track !== null) || [],
  };
};
