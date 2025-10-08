// Lightweight env reader; extend as needed
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || '3000',
  DATABASE_URL: process.env.DATABASE_URL || '',
  ACCESS_TOKEN_SECRET:
    process.env.ACCESS_TOKEN_SECRET ||
    'your-super-secret-access-token-key-here',
  REFRESH_TOKEN_SECRET:
    process.env.REFRESH_TOKEN_SECRET ||
    'your-super-secret-refresh-token-key-here',
  REDIS_URL:
    process.env.REDIS_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'redis://redis:6379'
      : 'redis://localhost:6379'),
};
console.log('env', env);
export default env;
