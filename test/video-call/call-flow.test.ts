// test/video-call/call-flow.test.ts
import { createTestClient, waitForConnect, waitForEvent } from '../utils/test-client';
import { SocketEvents } from '../../src/sockets/socket.events';
import type {
  IncomingCallPayload,
  CallAcceptedPayload,
  WebRTCOfferPayload,
  WebRTCAnswerPayload,
} from '../../src/types/call.type';

describe('Video Call Flow', () => {
  let clientA: ReturnType<typeof createTestClient>;
  let clientB: ReturnType<typeof createTestClient>;
  const conversationId = 'test-conv-123';

  beforeAll(async () => {
    clientA = createTestClient(1);
    clientB = createTestClient(2);
    await Promise.all([waitForConnect(clientA), waitForConnect(clientB)]);
  }, 10000);

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
    const incoming: IncomingCallPayload = await waitForEvent(clientB, SocketEvents.INCOMING_CALL);
    expect(incoming.fromUserId).toBe(1);

    clientB.emit(SocketEvents.CALL_ACCEPT, { fromUserId: 2 });

    // 3. Alice nhận call-accepted
    const accepted: CallAcceptedPayload = await waitForEvent(clientA, SocketEvents.CALL_ACCEPTED);
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
    clientA.emit(SocketEvents.WEBRTC_OFFER, { toUserId: 2, offer, conversationId });

    const offerData: WebRTCOfferPayload = await waitForEvent(clientB, SocketEvents.WEBRTC_OFFER);
    await pcB.setRemoteDescription(offerData.offer);
    const answer = await pcB.createAnswer();
    await pcB.setLocalDescription(answer);
    clientB.emit(SocketEvents.WEBRTC_ANSWER, { toUserId: 1, answer, conversationId });

    const answerData: WebRTCAnswerPayload = await waitForEvent(clientA, SocketEvents.WEBRTC_ANSWER);
    await pcA.setRemoteDescription(answerData.answer);

    expect(pcA.iceConnectionState).toBeTruthy();
  }, 15000);
});