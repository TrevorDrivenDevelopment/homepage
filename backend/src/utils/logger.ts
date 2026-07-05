/**
 * Minimal structured logger for Lambda/local dev.
 *
 * - debug/info are suppressed in production (NODE_ENV === 'production') to avoid
 *   noisy/costly CloudWatch logs and leaking internal details on every request.
 * - warn/error always log, since they're needed for production troubleshooting.
 */

const isProduction = process.env.NODE_ENV === 'production';

function format(level: string, message: string, meta?: unknown): [string, unknown?] {
  const prefix = `[${level}] ${message}`;
  return meta !== undefined ? [prefix, meta] : [prefix];
}

export const log = {
  debug(message: string, meta?: unknown): void {
    if (isProduction) return;
    console.log(...format('DEBUG', message, meta));
  },
  info(message: string, meta?: unknown): void {
    if (isProduction) return;
    console.log(...format('INFO', message, meta));
  },
  warn(message: string, meta?: unknown): void {
    console.warn(...format('WARN', message, meta));
  },
  error(message: string, meta?: unknown): void {
    console.error(...format('ERROR', message, meta));
  },
};
