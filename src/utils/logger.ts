/* Simple console-based logger. Replace with pino/winston if needed. */
export const logger = {
  info: (...args: unknown[]) => console.log('[info]', ...args),
  error: (...args: unknown[]) => console.error('[error]', ...args),
  warn: (...args: unknown[]) => console.warn('[warn]', ...args),
};

export default logger;
