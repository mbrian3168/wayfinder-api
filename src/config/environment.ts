import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  PORT: z.coerce.number().default(8080),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  FIREBASE_SERVICE_ACCOUNT_BASE64: z.string().min(100, 'FIREBASE_SERVICE_ACCOUNT_BASE64 is required'),
  PARTNER_API_KEY: z.string().min(32, 'PARTNER_API_KEY must be at least 32 characters'),
  ALLOWED_ORIGINS: z.string().optional().default('http://localhost:3000'),
});

export type Environment = z.infer<typeof envSchema>;

export const validateEnvironment = (): Environment => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.issues.forEach((issue) => {
        console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
      });
    }
    process.exit(1);
  }
};

export const env = validateEnvironment();
