import { createClient } from 'redis';

const isProduction = process.env.NODE_ENV === 'production';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const subscriber = createClient({
  url: REDIS_URL,
  socket: isProduction ? { tls: true, rejectUnauthorized: false } : undefined,
});

export const publisher = createClient({
  url: REDIS_URL,
  socket: isProduction ? { tls: true, rejectUnauthorized: false } : undefined,
});

subscriber.on('error', (err) => console.error('Redis Subscriber Error', err));
publisher.on('error', (err) => console.error('Redis Publisher Error', err));

// Start connecting to Redis (non-blocking)
// Consumers may await these if they need to ensure connection before proceeding.
subscriber.connect().catch((err) => console.error('Subscriber connect error', err));
publisher.connect().catch((err) => console.error('Publisher connect error', err));

export async function connectRedis(): Promise<void> {
  await Promise.all([subscriber.connect(), publisher.connect()]);
}

export default { subscriber, publisher, connectRedis };
