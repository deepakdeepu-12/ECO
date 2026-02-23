/**
 * Typed environment variable accessor.
 * Call validateEnv() at startup to fail fast on missing required vars.
 */
export const env = {
  PORT:          parseInt(process.env.PORT ?? '3001', 10),
  MONGODB_URI:   process.env.MONGODB_URI   ?? '',
  JWT_SECRET:    process.env.JWT_SECRET    ?? '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? '',
  EMAIL_USER:    process.env.EMAIL_USER    ?? '',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ?? '',
  EMAIL_FROM:    process.env.EMAIL_FROM    ?? '',
  NODE_ENV:      process.env.NODE_ENV      ?? 'development',
} as const;

/** Throws if a required env var is absent, stopping the process immediately. */
export const validateEnv = (): void => {
  const required: (keyof typeof env)[] = ['MONGODB_URI', 'JWT_SECRET'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length > 0) {
    throw new Error(`⛔ Missing required environment variables: ${missing.join(', ')}`);
  }
};
