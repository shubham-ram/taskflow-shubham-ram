import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/jwt";
import { config } from "../config";
import { validate } from "../middleware/validate";
import { registerSchema, loginSchema } from "../schemas/auth";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// POST /auth/register
router.post(
  "/register",
  validate(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        throw new AppError(400, "validation failed", {
          email: "already in use",
        });
      }

      const hashed = await bcrypt.hash(password, config.BCRYPT_ROUNDS);

      const user = await prisma.user.create({
        data: { name, email, password: hashed },
      });

      const token = signToken({ userId: user.id });

      res.status(201).json({
        token,
        user: { id: user.id, name: user.name, email: user.email },
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /auth/login
router.post(
  "/login",
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new AppError(401, "invalid email or password");
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new AppError(401, "invalid email or password");
      }

      const token = signToken({ userId: user.id });

      res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email },
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
