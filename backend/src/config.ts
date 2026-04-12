import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(8),
  JWT_EXPIRY: z.string().default("24h"),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).default(12),
  PORT: z.coerce.number().int().default(4000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;
