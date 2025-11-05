// test/video-call/call-reject.test.ts
import {
  createTestClient,
  waitForConnect,
  waitForEvent,
} from '../utils/test-client';
import { SocketEvents } from '../../src/sockets/socket.events';
import type { CallRejectedPayload } from '../../src/types/call.type';

describe('Call Reject', () => {
  let clientA: ReturnType<typeof createTestClient>;
  let clientB: ReturnType<typeof createTestClient>;

  beforeAll(async () => {
    clientA = createTestClient(10);
    clientB = createTestClient(11);
    await Promise.all([waitForConnect(clientA), waitForConnect(clientB)]);
  });

  afterAll(() => {
    clientA?.disconnect();
    clientB?.disconnect();
  });

  test('should reject call', async () => {
    clientA.emit(SocketEvents.CALL_START, {
      toUserId: 11,
      conversationId: 'x',
    });

    await waitForEvent(clientB, SocketEvents.INCOMING_CALL);
    clientB.emit(SocketEvents.CALL_REJECT, { fromUserId: 11 });

    const rejected: CallRejectedPayload = await waitForEvent(
      clientA,
      SocketEvents.CALL_REJECTED,
    );
    expect(rejected.fromUserId).toBe(11);
  });
});
