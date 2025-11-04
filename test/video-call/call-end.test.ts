// test/video-call/call-end.test.ts
import { createTestClient, waitForConnect, waitForEvent } from '../utils/test-client';
import { SocketEvents } from '../../src/sockets/socket.events';
import type { CallAcceptedPayload, CallEndedPayload } from '../../src/types/call.type';

describe('Call End Flow', () => {
  let clientA: ReturnType<typeof createTestClient>;
  let clientB: ReturnType<typeof createTestClient>;
  const conversationId = 'end-test-123';

  beforeAll(async () => {
    clientA = createTestClient(50);
    clientB = createTestClient(51);
    await Promise.all([waitForConnect(clientA), waitForConnect(clientB)]);
  }, 10000);

  afterAll(() => {
    clientA?.disconnect();
    clientB?.disconnect();
  });

  test('should end call and notify both users', async () => {
    // 1. Alice gọi → Bob chấp nhận
    clientA.emit(SocketEvents.CALL_START, { toUserId: 51, conversationId });
    await waitForEvent(clientB, SocketEvents.INCOMING_CALL);
    clientB.emit(SocketEvents.CALL_ACCEPT, { fromUserId: 51 });

    const accepted: CallAcceptedPayload = await waitForEvent(clientA, SocketEvents.CALL_ACCEPTED);
    expect(accepted.fromUserId).toBe(51);

    // 2. Alice kết thúc cuộc gọi
    clientA.emit(SocketEvents.CALL_END, {
      toUserId: 51,
      conversationId,
    });

    // 3. Bob nhận thông báo kết thúc
    const ended: CallEndedPayload = await waitForEvent(clientB, SocketEvents.CALL_ENDED);
    expect(ended.fromUserId).toBe(50);
  }, 10000);
});