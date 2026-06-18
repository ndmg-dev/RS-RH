export interface AppConfig {
  /** Gateway HTTP port */
  port: number;
  /** Spring Boot backend base URL */
  springBootUrl: string;
  /** MongoDB connection string (used by Prisma) */
  databaseUrl: string;
  /** Allowed CORS origins */
  corsOrigins: string[];
  /** Current environment */
  nodeEnv: string;
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config: AppConfig = {
  port: parseInt(process.env.GATEWAY_PORT || '3000', 10),
  springBootUrl: requireEnv('SPRING_BOOT_URL'),
  databaseUrl: requireEnv('DATABASE_URL'),
  corsOrigins: (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  nodeEnv: process.env.NODE_ENV || 'development',
};
