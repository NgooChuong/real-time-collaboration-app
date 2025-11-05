// test/video-call/call-flow.test.ts
import {
  createTestClient,
  waitForConnect,
  waitForEvent,
} from '../utils/test-client';
import { SocketEvents } from '../../src/sockets/socket.events';
import type {
  IncomingCallPayload,
  CallAcceptedPayload,
  WebRTCOfferPayload,
  WebRTCAnswerPayload,
} from '../../src/types/call.type';

// Mock RTCPeerConnection cho môi trường Node.js
interface RTCEvent {
  candidate?: RTCIceCandidateInit;
}

class MockRTCPeerConnection {
  private listeners: { [key: string]: ((ev: RTCEvent) => void)[] } = {};
  public localDescription: RTCSessionDescriptionInit | null = null;
  public remoteDescription: RTCSessionDescriptionInit | null = null;
  public iceConnectionState: string = 'new';

  addEventListener(event: string, callback: (ev: RTCEvent) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event: string, data: RTCEvent) {
    if (this.listeners[event]) {
      for (const callback of this.listeners[event]) {
        callback(data);
      }
    }
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    return {
      type: 'offer',
      sdp: 'mock-sdp-offer',
    };
  }

  async createAnswer(): Promise<RTCSessionDescriptionInit> {
    return {
      type: 'answer',
      sdp: 'mock-sdp-answer',
    };
  }

  async setLocalDescription(description: RTCSessionDescriptionInit) {
    this.localDescription = description;
  }

  async setRemoteDescription(description: RTCSessionDescriptionInit) {
    this.remoteDescription = description;
    // Giả lập trạng thái kết nối thành công
    this.iceConnectionState = 'connected';
  }

  set onicecandidate(callback: ((ev: RTCEvent) => void) | null) {
    if (callback) {
      this.addEventListener('icecandidate', callback);
      // Giả lập một ice candidate
      setTimeout(() => {
        this.emit('icecandidate', {
          candidate: {
            candidate: 'mock-ice-candidate',
            sdpMid: '0',
            sdpMLineIndex: 0,
          },
        });
      }, 100);
    }
  }
}

// Gán mock vào globalThis
globalThis.RTCPeerConnection =
  MockRTCPeerConnection as unknown as typeof RTCPeerConnection;

describe('Video Call Flow', () => {
  let clientA: ReturnType<typeof createTestClient>;
  let clientB: ReturnType<typeof createTestClient>;
  const conversationId = 'test-conv-123';

  beforeAll(async () => {
    console.log('[TEST] Creating clients...');
    clientA = createTestClient(1);
    clientB = createTestClient(2);

    console.log('[TEST] Waiting for connect...');
    await Promise.all([waitForConnect(clientA), waitForConnect(clientB)]);
    console.log('[TEST] Both connected');

    console.log('[TEST] Joining conversation...');
    clientA.emit(SocketEvents.JOIN_CONVERSATION, conversationId);
    clientB.emit(SocketEvents.JOIN_CONVERSATION, conversationId);

    await new Promise((r) => setTimeout(r, 1000));
    console.log('[TEST] Joined conversation');
  }, 20000);

  afterAll(() => {
    clientA?.disconnect();
    clientB?.disconnect();
  });

  test('should complete full call flow', async () => {
    // 1. Alice gọi
    clientA.emit(SocketEvents.CALL_START, {
      toUserId: 2,
      conversationId,
    });

    // 2. Bob nhận incoming-call → chấp nhận
    const incoming: IncomingCallPayload = await waitForEvent(
      clientB,
      SocketEvents.INCOMING_CALL,
    );
    expect(incoming.fromUserId).toBe(1);

    clientB.emit(SocketEvents.CALL_ACCEPT, { toUserId: 1 });

    // 3. Alice nhận call-accepted
    const accepted: CallAcceptedPayload = await waitForEvent(
      clientA,
      SocketEvents.CALL_ACCEPTED,
    );
    expect(accepted.fromUserId).toBe(2);

    // 4. WebRTC signaling
    const pcA = new RTCPeerConnection({ iceServers: [] });
    const pcB = new RTCPeerConnection({ iceServers: [] });

    pcA.onicecandidate = (e) =>
      e.candidate &&
      clientA.emit(SocketEvents.WEBRTC_ICE, {
        toUserId: 2,
        candidate: e.candidate,
        conversationId,
      });

    pcB.onicecandidate = (e) =>
      e.candidate &&
      clientB.emit(SocketEvents.WEBRTC_ICE, {
        toUserId: 1,
        candidate: e.candidate,
        conversationId,
      });

    const offer = await pcA.createOffer();
    await pcA.setLocalDescription(offer);
    clientA.emit(SocketEvents.WEBRTC_OFFER, {
      toUserId: 2,
      offer,
      conversationId,
    });

    const offerData: WebRTCOfferPayload = await waitForEvent(
      clientB,
      SocketEvents.WEBRTC_OFFER,
    );
    await pcB.setRemoteDescription(offerData.offer);
    const answer = await pcB.createAnswer();
    await pcB.setLocalDescription(answer);
    clientB.emit(SocketEvents.WEBRTC_ANSWER, {
      toUserId: 1,
      answer,
      conversationId,
    });

    const answerData: WebRTCAnswerPayload = await waitForEvent(
      clientA,
      SocketEvents.WEBRTC_ANSWER,
    );
    await pcA.setRemoteDescription(answerData.answer);

    expect(pcA.iceConnectionState).toBeTruthy();
  }, 15000);
});
