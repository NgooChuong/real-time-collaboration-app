// test/video-call/call-offline.test.ts
import { createTestClient, waitForConnect, waitForEvent } from '../utils/test-client';
import { SocketEvents } from '../../src/sockets/socket.events';
import type { CallErrorPayload } from '../../src/types/call.type';

describe('Call Offline User', () => {
  let clientA: ReturnType<typeof createTestClient>;

  beforeAll(async () => {
    clientA = createTestClient(100);
    await waitForConnect(clientA);
  });

  afterAll(() => clientA?.disconnect());

  test('should return error when user offline', async () => {
    clientA.emit(SocketEvents.CALL_START, { toUserId: 999, conversationId: 'x' });

    const error: CallErrorPayload = await waitForEvent(clientA, SocketEvents.CALL_ERROR);
    expect(error.error).toBe('User offline');
  });
});