import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "is required"),
  email: z.string().email("must be a valid email"),
  password: z.string().min(6, "must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("must be a valid email"),
  password: z.string().min(6, "is required"),
});
